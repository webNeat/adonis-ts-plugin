import type ts from 'typescript'

type PluginContext<Config = unknown> = {
  ts: typeof import('typescript/lib/tsserverlibrary')
  info: ts.server.PluginCreateInfo
  service: ts.LanguageService
  config: Config
}

export function make({ts, info, service, config}: PluginContext) {
  service.getSemanticDiagnostics = (fileName) => {
    const diagnostics = info.languageService.getSemanticDiagnostics(fileName)
    const sourceFile = service.getProgram()?.getSourceFile(fileName)
    if (!sourceFile) return diagnostics
    function checkNode(node: ts.Node) {
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
        const methodName = node.expression.name.text
        if (methodName === 'resource' && isAdonisRouter(service, node.expression.expression)) {
          const existingMethods = new Set(getControllerMethods(ts, service, node))
          const missingMethods: string[] = []
          for (const method of getExpectedMethods(ts, node)) {
            if (!existingMethods.has(method)) missingMethods.push(method)
          }
          if (missingMethods.length > 0) {
            diagnostics.push({
              file: sourceFile,
              start: node.getStart(),
              length: node.getEnd() - node.getStart(),
              messageText: `The following methods are missing on the controller: ${missingMethods.join(', ')}`,
              category: ts.DiagnosticCategory.Error,
              code: 9999, // Custom error code
            })
          }
        }
      }
      ts.forEachChild(node, checkNode)
    }
    checkNode(sourceFile)
    return diagnostics
  }
  return service
}

function isAdonisRouter(service: ts.LanguageService, object: ts.LeftHandSideExpression) {
  const symbol = service.getProgram()?.getTypeChecker()?.getTypeAtLocation(object)?.getSymbol()
  return (
    symbol &&
    symbol.getName() === 'HttpRouterService' &&
    symbol.getDeclarations()?.find((x) => x.getSourceFile().fileName.endsWith('node_modules/@adonisjs/core/build/src/types.d.ts'))
  )
}

// TODO: get only valid handlers
function getControllerMethods(ts: typeof import('typescript/lib/tsserverlibrary'), service: ts.LanguageService, node: ts.CallExpression): string[] {
  if (node.arguments.length < 2) return []
  const methods: string[] = []
  const typeChecker = service.getProgram()?.getTypeChecker()
  const controllerType = typeChecker?.getTypeAtLocation(node.arguments[1])
  if (!typeChecker || !controllerType) return []
  for (const member of controllerType.getSymbol()?.members?.values() || []) {
    const declarations = member.valueDeclaration ? [member.valueDeclaration] : member.declarations
    for (const declaration of declarations || []) {
      if (!ts.isMethodDeclaration(declaration)) continue
      methods.push(member.getName())
    }
  }
  return methods
}

function getExpectedMethods(ts: typeof import('typescript/lib/tsserverlibrary'), current: ts.Node) {
  let methods = ['index', 'create', 'store', 'show', 'edit', 'update', 'destroy']
  while (current && ts.isCallExpression(current.parent.parent)) {
    const node = current.parent.parent as ts.CallExpression
    if (!ts.isPropertyAccessExpression(node.expression)) break
    const method = node.expression.name.text
    if (method === 'apiOnly') {
      methods = methods.filter((x) => x !== 'create' && x !== 'edit')
    }
    if (method === 'only') {
      const arg = node.arguments[0]
      if (arg && ts.isArrayLiteralExpression(arg)) {
        const values = arg.elements.map((x) => x.getText().slice(1, -1))
        methods = methods.filter((x) => values.includes(x))
      }
    }
    if (method === 'except') {
      const arg = node.arguments[0]
      if (arg && ts.isArrayLiteralExpression(arg)) {
        const values = arg.elements.map((x) => x.getText().slice(1, -1))
        methods = methods.filter((x) => !values.includes(x))
      }
    }
    current = node
  }
  return methods
}
