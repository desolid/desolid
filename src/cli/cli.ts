#!/usr/bin/env node
import * as clear from 'clear';
import * as path from 'path';
import * as program from 'commander';
import { Desolid } from '../Desolid';
import { error, info } from '../utils';

async function main() {
    clear();
    program
        .version(info.version)
        .description(info.description)
        .option('-p, --path <path>', 'Root desolid directory', process.cwd())
        .parse(process.argv);
    const args = program.opts();
    const root = path.isAbsolute(args.path) ? args.path : path.join(process.cwd(), args.path);
    const desolid = new Desolid(root);
    await desolid.start();
}

main().catch(({ message }) => {
    error(message);
});
