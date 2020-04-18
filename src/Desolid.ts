import { readFileSync } from 'fs-extra';
import * as yaml from 'js-yaml';
import { DatabaseConfig, Database } from './database';
import { GraphQLAPIConfig, GraphQLAPI } from './graphql';
import { Schema } from './schema';

export interface DesolidConfig {
    api: GraphQLAPIConfig;
    database: DatabaseConfig;
}

export default class Desolid {
    protected config: DesolidConfig;
    protected database: Database;
    protected api: GraphQLAPI;
    protected schema: Schema;
    constructor(public readonly path: string) {
        this.config = yaml.safeLoad(readFileSync(`${path}/desolid.yaml`, { encoding: 'utf8' }));
        this.schema = new Schema(path);
        this.database = new Database(this.config.database, this.schema.models);
        this.api = new GraphQLAPI(this.config.api, this.schema.models);
    }
    
    public async start() {
        await this.database.start();
        await this.api.start();
    }
}
