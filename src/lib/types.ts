import type ts from 'typescript'

export type TS = typeof ts

export type Modules = {
  typescript: TS
}

export type Plugin = (modules: Modules) => {
  create: (info: ts.server.PluginCreateInfo) => ts.LanguageService
}

export type Context = {
  ts: TS
  program: ts.Program
}

export type Feature = {
  getErrors?: (ctx: Context, node: ts.Node) => FeatureError[]
  // other methods will be added when needed
}

export type FeatureError = {
  code: number
  message: string
}

export type TypeId = {
  name: string
  filename: string
}

export type Visibility = 'public' | 'protected' | 'private'
export type Method = {
  visibility: Visibility
  name: string
  args: ts.Node[]
}
