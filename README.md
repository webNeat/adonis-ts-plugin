# Adonis Typescript Plugin

A Typescript plugin for additional type-checking in Adonis projects.

# Setup

1. Install the plugin as a dev dependency

```
npm i -D adonis-ts-plugin
```

2. Add the plugin to your `tsconfig.json`

```json
{
  "compilerOptions": {
    /* ... */
    "plugins": [
      {
        "name": "adonis-ts-plugin"
      }
    ]
  }
}
```

3. if you are using VSCode, configure it to use the Typescript version from `node_modules` by adding the following to the project settings:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

# Features

## `router.resource` type-checking

This plugin improves the type-checking of the `router.resource` method.

Without the plugin, the following code doesn't show any errors:
```ts
import router from '@adonisjs/core/services/router'

class TestController {}

router.resource('test', TestController) // <- TS does not complain
```

With the plugin, the same code will show the following error on the `router.resource` call:
```
The following methods are missing on the controller: index, create, store, show, edit, update, destroy
```

# Command line tool

This plugin comes with a command-line tool that can be used to show the additional type errors (because the default `tsc` does not include the diagnostics from plugins).

To check the whole project use
```
npx adonis-ts-plugin check
```

You can also check only one or multiple files by providing them in the arguments:
```
npx adonis-ts-plugin check src/path/to/file1.ts src/path/to/file2.ts
```

if you want the command to print the errors as a JSON array, use the `--json` flag:
```
npx adonis-ts-plugin check --json src/path/to/file1.ts src/path/to/file2.ts
```

The resulting JSON is something like the following
```json
[
  {
    "start": [5, 1],
    "end": [5, 40],
    "category": 1,
    "code": 99001,
    "message": "The following methods are missing on the controller: index, create, store, show, edit, update, destroy"
  }
]
```
