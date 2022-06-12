# foundry-docgen

**Note:** Work in progress, very buggy, barely works

A basic tool for generating markdown docs for a [Foundry](https://github.com/foundry-rs/foundry) project using existing NatSpec comments in the contracts. Uses [solidity-docgen](https://github.com/OpenZeppelin/solidity-docgen) under the hood.

## Usage

In the root directory of your Foundry project, run

```bash
npx foundry-docgen
```

This will generate docs for all contracts under `./docgen`. Alternatively, specify a list of contracts you want to generate docs for, e.g.

```bash
npx foundry-docgen Greeter MyNFT
```

You can also specify the input and output paths. For instance,

```bash
npx foundry-docgen --in ~/Documents/foundry-project/out --out ./documentations
```

Use `npx foundry-docgen help` to see all options.

## Known issues

- Running `npx foundry-docgen` for complex projects can trigger the error `Error: Circular dependency detected: aliased imports not supported`.
- Running `npx foundry-docgen SomeContract` may trigger errors like `Error: No node with id 2944 of type SourceUnit` due to `SomeContract`'s Solidity AST referencing other contracts as dependencies.