import path from 'path'
import type ts from 'typescript'
import {Context, Method, TypeId, Visibility} from './types.js'

export function hasTypeId(ctx: Context, type: ts.Type, id: TypeId) {
  const checker = ctx.program.getTypeChecker()
  const name = checker.typeToString(type)
  const declarations = type.getSymbol()?.getDeclarations()
  const filenames = declarations?.map((x) => path.resolve(x.getSourceFile().fileName)) || []
  if (name === id.name && filenames.some((x) => x.endsWith(id.filename))) return true
  if (!type.isClassOrInterface()) return false
  for (const parent of checker.getBaseTypes(type)) {
    if (hasTypeId(ctx, parent, id)) {
      return true
    }
  }
  return false
}

export function getClassParent(ctx: Context, node: ts.Node): ts.Node | undefined {
  const checker = ctx.program.getTypeChecker()
  const type = checker.getTypeAtLocation(node)
  let symbol = type.getSymbol()
  while (symbol && symbol.flags & ctx.ts.SymbolFlags.Alias) {
    symbol = checker.getAliasedSymbol(symbol)
  }
  const declaration = symbol?.declarations?.find(ctx.ts.isClassDeclaration)
  const heritageClause = declaration?.heritageClauses?.find((hc) => hc.token === ctx.ts.SyntaxKind.ExtendsKeyword)
  if (heritageClause && heritageClause.types.length > 0) {
    return heritageClause.types[0]
  }
  return undefined
}

export function getClassMethods(ctx: Context, node: ts.Node): Method[] {
  const checker = ctx.program.getTypeChecker()
  const type = checker.getTypeAtLocation(node)
  let symbol = type.getSymbol()
  while (symbol && symbol.flags & ctx.ts.SymbolFlags.Alias) {
    symbol = checker.getAliasedSymbol(symbol)
  }
  const declaration = symbol?.declarations?.find(ctx.ts.isClassDeclaration)
  if (!declaration) return []
  const methods: Method[] = []
  const parent = getClassParent(ctx, node)
  if (parent) methods.push(...getClassMethods(ctx, parent))
  for (const member of declaration.members) {
    if (!ctx.ts.isMethodDeclaration(member)) continue
    methods.push({
      name: ctx.ts.isIdentifier(member.name) ? member.name.text : '',
      visibility: getClassMemeberVisibility(ctx, member),
      args: Array.from(member.parameters),
    })
  }
  return methods
}

export function getClassMemeberVisibility(ctx: Context, member: ts.MethodDeclaration): Visibility {
  for (const modifier of member.modifiers || []) {
    if (modifier.kind === ctx.ts.SyntaxKind.PublicKeyword) return 'public'
    if (modifier.kind === ctx.ts.SyntaxKind.PrivateKeyword) return 'private'
    if (modifier.kind === ctx.ts.SyntaxKind.ProtectedKeyword) return 'protected'
  }
  return 'public'
}

export function getType(ctx: Context, node: ts.Node) {
  return ctx.program.getTypeChecker().getTypeAtLocation(node)
}

function getDeclarationFiles(symbol: ts.Symbol) {
  return symbol.getDeclarations()?.map((x) => x.getSourceFile().fileName) || []
}
