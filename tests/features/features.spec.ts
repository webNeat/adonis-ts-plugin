import {test} from '@japa/runner'
import {exec} from 'child_process'
import {existsSync, readdirSync} from 'fs'
import {readFile} from 'fs/promises'

for (const feature of getFeatures()) {
  test.group(feature, () => {
    for (const testName of getTestNames(feature)) {
      if (hasDiagnostics(feature, testName)) createDiagnosticsTest(feature, testName)
    }
  })
}

function getFeatures() {
  const entries = readdirSync('features', {withFileTypes: true})
  return entries.filter((x) => x.isDirectory()).map((x) => x.name)
}

function getTestNames(feature: string) {
  const entries = readdirSync(`features/${feature}`, {withFileTypes: true})
  return entries.filter((x) => x.isDirectory()).map((x) => x.name)
}

function getSourceFilePath(feature: string, testName: string) {
  return `features/${feature}/${testName}/main.ts`
}

function getDiagnosticsFilePath(feature: string, testName: string) {
  return `features/${feature}/${testName}/diagnostics.json`
}

async function getDiagnostics(feature: string, testName: string) {
  return new Promise<unknown[]>((resolve, reject) => {
    const filename = getSourceFilePath(feature, testName)
    exec(`npx adonis-ts-plugin check ${filename} --json`, (execErr, stdout) => {
      if (execErr) reject(execErr)
      try {
        resolve(JSON.parse(stdout))
      } catch (jsonErr) {
        reject(jsonErr)
      }
    })
  })
}

async function getExpectedDiagnostics(feature: string, testName: string) {
  const sourcePath = getSourceFilePath(feature, testName)
  const diagnosticsPath = getDiagnosticsFilePath(feature, testName)
  const content = await readFile(diagnosticsPath, 'utf8')
  const diagnostics = JSON.parse(content)
  for (const x of diagnostics) x.filename = sourcePath
  return diagnostics
}

function compareDiagnostics(a: any, b: any) {
  if (a.filename === b.filename) {
    if (a.start.line === b.start.line) return a.start.col - b.start.col
    return a.start.line - b.start.line
  }
  return a.filename < b.filename ? -1 : 1
}

function hasDiagnostics(feature: string, testName: string) {
  return existsSync(getDiagnosticsFilePath(feature, testName))
}

function createDiagnosticsTest(feature: string, testName: string) {
  test(`${testName} - diagnostics`, async ({expect}) => {
    const current = await getDiagnostics(feature, testName)
    const expected = await getExpectedDiagnostics(feature, testName)
    current.sort(compareDiagnostics)
    expected.sort(compareDiagnostics)
    expect(current).toEqual(expected)
  })
}
