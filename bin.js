#!/usr/bin/env node

import { docgen } from "solidity-docgen";
import { readdir, readFile } from "node:fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    const argv = yargs(hideBin(process.argv))
        .usage("Usage: npx $0 [contracts] [options]")
        .example(
            "npx $0 SomeContract AnotherContract --in ~/my-foundry-repo/out --out ./docs"
        )
        .help("h")
        .alias("h", "help")
        .alias("i", "in")
        .alias("o", "out")
        .alias("v", "version")
        .alias("t", "templates")
        .describe("i", "Path to the Foundry project's artifacts directory")
        .describe(
            "o",
            "The directory where the markdown docs will be output into"
        )
        .describe("t", "The directory with the Handlebars templates for generating the markdown files")
        .default("i", "./out")
        .default("o", "./docgen")
        .default("t", `${__dirname}/templates`).argv;

    const inputPath = argv.in;
    const outputPath = argv.out;

    let solidityFileDirs;
    if (argv._.length > 0) {
        solidityFileDirs = argv._.map(
            (solidityFileName) => `${solidityFileName}.sol`
        );
    } else {
        solidityFileDirs = await readdir(inputPath);
    }

    const solcOutput = { sources: {} };
    await Promise.all(
        solidityFileDirs.map(async (dir) => {
            const stdJsonOutputFiles = await readdir(`${inputPath}/${dir}`);
            await Promise.all(
                stdJsonOutputFiles.map(async (stdJsonFile) => {
                    const stdJsonOutput = JSON.parse(
                        (
                            await readFile(`${inputPath}/${dir}/${stdJsonFile}`)
                        ).toString()
                    );
                    const solidityFileName =
                        stdJsonFile.slice(0, stdJsonFile.length - 5) + ".sol";
                    solcOutput.sources[solidityFileName] = stdJsonOutput;
                })
            );
        })
    );

    await docgen(
        [
            {
                input: { sources: {} },
                output: solcOutput,
            },
        ],
        {
            outputDir: outputPath,
            pages: "items",
            templates: argv.templates,
        }
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
