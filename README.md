  

# Tsc-Cmp

A typescript compiler, that use SWC and ESBUILD.

- To install: `npm i -g tsc-cmp` or `npm i -D tsc-cmp`

  

- To use: `tsc-cmp [source] [flags]` or `npx tsc-cmp [source] [flags]`

  

**Flags:**

|flag| What it do |
|--------------|--|
| --watch | Watch for changes |
| --noTypeCheck | No type check before compilation |
| --build [Out put dir] | Build the project |
| --bundle [Out put file] | Make a bundle of the project |

A reason why you wanna use this, is: When you are using **allowImportTsExtensions** in your **tsconfig.json**. This compiler takes the **.ts** files, compile it, and change the **.ts** to **.js** in the import statements.

**Notes:**

You can combine every flags, for example: 

**tsc-cmp src/index.ts** `--watch` `--noTypeCheck` `--build build` `--bundle bin/index.js`

When you are using the `--bundle` flag, it uses EsBuild for the bundle, but, use SWC as a plugin, this, to solve the possible `emitDecoratorMetadata` problem.

Tsc-cmp saves a basic .swcrc and a tsconfig.json when those, doesn't exist!