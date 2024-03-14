import path from 'path'
import ts from 'typescript'
import {normalize} from 'path'
import * as fs from 'fs/promises'
import {features} from '../features/index.js'
import {getSemanticDiagnostics} from '../lib/index.js'

export async function check(args: string[]) {
  const flags = args.filter((x) => x.startsWith('--'))
  const files = args.filter((x) => !x.startsWith('--'))
  const tsconfig = ts.parseJsonConfigFileContent(JSON.parse(await fs.readFile('tsconfig.json', 'utf8')), ts.sys, './')
  const program = ts.createProgram(tsconfig.fileNames, tsconfig.options)
  const diagnostics: ts.Diagnostic[] = []
  let sourceFiles = program.getSourceFiles()
  if (files.length) {
    const absolutePaths = new Set(files.map((x) => path.resolve(x)))
    sourceFiles = sourceFiles.filter((x) => absolutePaths.has(path.resolve(x.fileName)))
  }
  for (const sourceFile of sourceFiles) {
    diagnostics.push(...getSemanticDiagnostics({ts, program}, features, sourceFile))
  }
  console.log(flags.includes('--json') ? formatAsJson(diagnostics) : formatAsColoredString(diagnostics))
}

function formatAsColoredString(diagnostics: ts.Diagnostic[]) {
  return ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: normalize,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine,
  })
}

function formatAsJson(diagnostics: ts.Diagnostic[]) {
  const items = diagnostics
    .filter((x) => x.file)
    .map((x) => {
      const start = x.file!.getLineAndCharacterOfPosition(x.start || 0)
      const end = x.file!.getLineAndCharacterOfPosition(x.start! + (x.length || 0))
      return {
        filename: x.file!.fileName,
        start: [start.line + 1, start.character + 1],
        end: [end.line + 1, end.character + 1],
        code: x.code,
        category: x.category,
        message: typeof x.messageText === 'string' ? x.messageText : x.messageText.messageText,
      }
    })
  return JSON.stringify(items)
}
