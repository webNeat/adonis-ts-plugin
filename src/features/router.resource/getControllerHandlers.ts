import type ts from 'typescript'
import * as config from '../../config.js'
import {Context, getClassMethods, getClassParent, hasTypeId} from '../../lib/index.js'

/**
 * Returns the list of handlers names from a controller type.
 */
export function getControllerHandlers(ctx: Context, node: ts.Node): string[] {
  const checker = ctx.program.getTypeChecker()
  const handlersNames: string[] = []
  const parent = getClassParent(ctx, node)
  if (parent) handlersNames.push(...getControllerHandlers(ctx, parent))
  for (const method of getClassMethods(ctx, node)) {
    if (method.visibility !== 'public') continue
    if (method.args.length == 0 || hasTypeId(ctx, checker.getTypeAtLocation(method.args[0]), config.httpContextTypeId)) {
      handlersNames.push(method.name)
    }
  }
  return Array.from(new Set(handlersNames))
}
