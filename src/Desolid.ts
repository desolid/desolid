import { readFileSync, existsSync } from 'fs-extra';
import * as yaml from 'js-yaml';
import * as chalk from 'chalk';
import * as figlet from 'figlet';
import * as path from 'path';
import * as _ from 'lodash';
import { DatabaseConfig, Database } from './database';
import { GraphQLAPIConfig, GraphQLAPI } from './api';
import { StorageConfig, Storage } from './storage';
import { Schema } from './schema';
import { log, logger } from './utils';

const info = require('../package.json');

export interface DesolidConfig {
    api?: GraphQLAPIConfig;
    database?: DatabaseConfig;
    storage?: StorageConfig;
}

export class Desolid {
    public readonly config: DesolidConfig;
    public readonly storage: Storage;
    public readonly database: Database;
    public readonly api: GraphQLAPI;
    public readonly schema: Schema;

    constructor(public readonly root: string, config?: DesolidConfig) {
        console.log(chalk.green(figlet.textSync('Desolid', { horizontalLayout: 'full' })));
        console.log(info.description);
        console.log(`🔥 v${info.version} running in "${process.platform}" on "${root}"\n`);
        logger.profile('🚀');
        log('Compiling Schema ...');
        this.config = _.merge({}, this.loadConfig(), config);
        this.schema = new Schema(root);
        this.storage = new Storage(root, this.config.storage, this.schema.models);
        this.database = new Database(this.config.database, this.schema.models, this.storage);
        this.api = new GraphQLAPI(this.config.api, this.database.models, this.storage);
    }

    private loadConfig() {
        const configFilePath = path.join(this.root, 'desolid.yaml');
        if (existsSync(configFilePath)) {
            const configFile = readFileSync(configFilePath, { encoding: 'utf8' });
            return yaml.safeLoad(configFile);
        }
    }

    public async start() {
        log(`Connecting to database ...`);
        await this.database.start();
        log(`Connected to "${this.database}"`);
        log('Starting server ...');
        await this.api.start();
        logger.profile('🚀');
    }
}
