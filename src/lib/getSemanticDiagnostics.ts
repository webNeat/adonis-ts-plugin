import type ts from 'typescript'
import {Feature, Context} from './types.js'

export function getSemanticDiagnostics(ctx: Context, features: Feature[], sourceFile: ts.SourceFile) {
  const diagnostics: ts.Diagnostic[] = []
  for (const feature of features) {
    diagnostics.push(...getFeatureDiagnostics(ctx, feature, sourceFile))
  }
  return diagnostics
}

function getFeatureDiagnostics(ctx: Context, feature: Feature, sourceFile: ts.SourceFile) {
  const diagnostics: ts.Diagnostic[] = []
  if (!feature.getErrors) return diagnostics
  eachNode(ctx, sourceFile, (node: ts.Node) => {
    for (const {code, message} of feature.getErrors!(ctx, node)) {
      diagnostics.push({
        file: sourceFile,
        category: ctx.ts.DiagnosticCategory.Error,
        code,
        messageText: message,
        start: node.getStart(),
        length: node.getWidth(),
      })
    }
  })
  return diagnostics
}

function eachNode(ctx: Context, parent: ts.Node, fn: (node: ts.Node) => void) {
  ctx.ts.forEachChild(parent, function visit(node) {
    fn(node)
    ctx.ts.forEachChild(node, visit)
  })
}
