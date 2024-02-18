import type ts from 'typescript'
import {Context} from '../../lib/index.js'

export function getExpectedHandlers(ctx: Context, current: ts.Node) {
  let methods = ['index', 'create', 'store', 'show', 'edit', 'update', 'destroy']
  while (current && ctx.ts.isCallExpression(current.parent.parent)) {
    const node = current.parent.parent as ts.CallExpression
    if (!ctx.ts.isPropertyAccessExpression(node.expression)) break
    const method = node.expression.name.text
    if (method === 'apiOnly') {
      methods = methods.filter((x) => x !== 'create' && x !== 'edit')
    }
    if (method === 'only') {
      const values = getTupleValues(ctx, node.arguments[0])
      methods = methods.filter((x) => values.includes(x))
    }
    if (method === 'except') {
      const values = getTupleValues(ctx, node.arguments[0])
      methods = methods.filter((x) => !values.includes(x))
    }
    current = node
  }
  return methods
}

export function getTupleValues(ctx: Context, arg?: ts.Node): string[] {
  if (!arg) return []
  const checker = ctx.program.getTypeChecker()
  const type = checker.getTypeAtLocation(arg)
  const text = checker.typeToString(type, undefined, ctx.ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType | ctx.ts.TypeFormatFlags.NoTruncation)
  return Array.from(text.match(/'[^']+'/g) || []).map((x) => x.slice(1, -1))
}
