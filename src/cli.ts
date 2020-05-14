#!/usr/bin/env node
import * as chalk from 'chalk';
import * as clear from 'clear';
import * as figlet from 'figlet';
import * as path from 'path';
import * as program from 'commander';
import { version } from '../package.json';

clear();
console.log(chalk.green(figlet.textSync('Desolid', { horizontalLayout: 'full' })));
program
    .version(version)
    .description(`Desolid: Single file BaaS\nhttps://github.com/desolid/desolid`)
    .option('-p, --path', 'Root desolid directory')
    .parse(process.argv);
