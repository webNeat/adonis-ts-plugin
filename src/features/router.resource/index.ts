import type ts from 'typescript'
import * as config from '../../config.js'
import {Context, hasTypeId} from '../../lib/index.js'
import {getExpectedHandlers} from './getExpectedHandlers.js'
import {getControllerHandlers} from './getControllerHandlers.js'

export function getErrors(ctx: Context, node: ts.Node) {
  if (!isRouterResourceCall(ctx, node) || node.arguments.length < 2) return []
  const existingMethods = new Set(getControllerHandlers(ctx, node.arguments[1]))
  const expectedMethods = getExpectedHandlers(ctx, node)
  const missingMethods = expectedMethods.filter((x) => !existingMethods.has(x))
  if (missingMethods.length === 0) return []
  return [config.errors.missingControllerMethods(missingMethods)]
}

function isRouterResourceCall(ctx: Context, node: ts.Node): node is ts.CallExpression {
  if (!ctx.ts.isCallExpression(node) || !ctx.ts.isPropertyAccessExpression(node.expression)) return false
  const checker = ctx.program.getTypeChecker()
  const propertyName = node.expression.name.text
  return propertyName === 'resource' && hasTypeId(ctx, checker.getTypeAtLocation(node.expression.expression), config.routerTypeId)
}
