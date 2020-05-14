#!/usr/bin/env node
import * as chalk from 'chalk';
import * as clear from 'clear';
import * as figlet from 'figlet';
import * as path from 'path';
import * as program from 'commander';
import Desolid from './Desolid';

async function main() {
    clear();
    console.log(chalk.green(figlet.textSync('Desolid', { horizontalLayout: 'full' })));

    // program
    //     .version(process.env.npm_package_version)
    //     .description(process.env.npm_package_description)
    //     .option('-p, --path', 'Root desolid directory')
    //     .parse(process.argv);

    const desolid = new Desolid(process.cwd());
    await desolid.start();
}

main();
