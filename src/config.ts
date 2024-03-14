import {TypeId} from './lib/index.js'

export const errors = {
  missingControllerMethods: (missingMethods: string[]) => ({
    code: 99001,
    message: `The following methods are missing on the controller: ${missingMethods.join(', ')}`,
  }),
}

export const routerTypeId: TypeId = {
  name: 'HttpRouterService',
  filename: 'node_modules/@adonisjs/core/build/src/types.d.ts',
}

export const httpContextTypeId: TypeId = {
  name: 'HttpContext',
  filename: 'node_modules/@adonisjs/http-server/build/src/http_context/main.d.ts',
}
