import {expect} from '@japa/expect'
import {configure, processCLIArgs, run} from '@japa/runner'

processCLIArgs(process.argv.splice(2))
configure({
  files: ['features/**/*.spec.ts'],
  plugins: [expect()],
  timeout: 10_000,
})

run()
