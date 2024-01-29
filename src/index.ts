import ts from 'typescript'
import {make} from './make'
import {createProxy} from './utils'

type Modules = {
  typescript: typeof import('typescript/lib/tsserverlibrary')
}

export = (modules: Modules) => {
  const ts = modules.typescript
  return {
    create: (info: ts.server.PluginCreateInfo) => make({ts, info, service: createProxy(info.languageService), config: info.config}),
  }
}
