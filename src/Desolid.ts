import { readFileSync } from 'fs-extra';
import * as yaml from 'js-yaml';
import { DatabaseConfig, Database } from './database';
import { GraphQLAPIConfig, GraphQLAPI } from './api';
import { Schema } from './schema';

export interface DesolidConfig {
    api: GraphQLAPIConfig;
    database: DatabaseConfig;
}

export default class Desolid {
    protected readonly config: DesolidConfig;
    protected readonly database: Database;
    protected readonly api: GraphQLAPI;
    protected readonly schema: Schema;
    constructor(public readonly path: string) {
        this.config = yaml.safeLoad(readFileSync(`${path}/desolid.yaml`, { encoding: 'utf8' }));
        this.schema = new Schema(path);
        this.database = new Database(this.config.database, this.schema.models);
        this.api = new GraphQLAPI(this.config.api, this.database.models);
    }
    
    public async start() {
        await this.database.start();
        await this.api.start();
    }
}
