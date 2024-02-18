import {check} from './check.js'

export async function main([command, ...args]: string[]) {
  if (command === 'check') return check(args)
  console.log(`Adonis Typescript Plugin
  Usage: 
    adonis-ts-plugin check [--json]     Check for Typescript errors  
  `)
  process.exit(1)
}
