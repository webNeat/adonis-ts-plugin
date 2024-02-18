import type ts from 'typescript'
import {Feature, Modules} from './types.js'
import {getSemanticDiagnostics} from './getSemanticDiagnostics.js'

export function createPlugin(features: Feature[]) {
  return (modules: Modules) => {
    const ts = modules.typescript
    return {
      create: (info: ts.server.PluginCreateInfo) => {
        const service = createProxy(info.languageService)
        service.getSemanticDiagnostics = (filename) => {
          const program = service.getProgram()
          const sourceFile = program?.getSourceFile(filename)
          const diagnostics = info.languageService.getSemanticDiagnostics(filename)
          if (program && sourceFile) diagnostics.push(...getSemanticDiagnostics({ts, program}, features, sourceFile))
          return diagnostics
        }
        return service
      },
    }
  }
}

function createProxy<T extends object>(value: T): T {
  const proxy: T = Object.create(null)
  for (let k of Object.keys(value) as Array<keyof T>) {
    const x = value[k]!
    // @ts-expect-error
    proxy[k] = (...args: Array<{}>) => x.apply(value, args)
  }
  return proxy
}
