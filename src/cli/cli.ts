#!/usr/bin/env node
import * as chalk from 'chalk';
import * as clear from 'clear';
import * as figlet from 'figlet';
import * as path from 'path';
import * as program from 'commander';
import { Desolid } from '../Desolid';
import { logger } from '../utils';

async function main() {
    clear();
    console.log(chalk.green(figlet.textSync('Desolid', { horizontalLayout: 'full' })));
    console.log(process.env.npm_package_description);
    console.log(`V${process.env.npm_package_version}`);
    // program
    //     .version(process.env.npm_package_version)
    //     .description(process.env.npm_package_description)
    //     .option('-p, --path', 'Root desolid directory')
    //     .parse(process.argv);

    const desolid = new Desolid(process.cwd());
    await desolid.start();
}

main().catch((error) => {
    logger.error(error.message);
});
