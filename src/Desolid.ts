import { readFileSync, existsSync } from 'fs-extra';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { DatabaseConfig, Database } from './database';
import { GraphQLAPIConfig, GraphQLAPI } from './api';
import { StorageConfig, Storage } from './storage';
import { Schema } from './schema';
import { log, logger } from './utils/Logger';

export interface DesolidConfig {
    api: GraphQLAPIConfig;
    database: DatabaseConfig;
    storage: StorageConfig;
}

export default class Desolid {
    protected readonly config: DesolidConfig;
    protected readonly storage: Storage;
    protected readonly database: Database;
    protected readonly api: GraphQLAPI;
    protected readonly schema: Schema;

    constructor(public readonly root: string) {
        logger.profile('🚀');
        log('Compiling Schema ...');
        this.config = this.loadConfigs() || {};
        this.schema = new Schema(root);
        this.storage = new Storage(root, this.config.storage, this.schema.models);
        this.database = new Database(this.config.database, this.schema.models, this.storage);
        this.api = new GraphQLAPI(this.config.api, this.database.models, this.storage);
    }

    private loadConfigs() {
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
