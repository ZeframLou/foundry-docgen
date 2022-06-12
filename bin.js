#!/usr/bin/env node

import { docgen } from "solidity-docgen";
import { readdir, readFile } from "node:fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

async function main() {
    const argv = yargs(hideBin(process.argv)).argv;

    let inputPath = "./out"; // default Foundry output path
    if (argv.in) {
        inputPath = argv.in;
    }

    let outputPath = "./docgen"; // default output path
    if (argv.out) {
        outputPath = argv.out;
    }

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
            templates: "templates",
        }
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
