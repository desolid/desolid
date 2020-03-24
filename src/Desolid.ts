import { readFileSync } from 'fs-extra';
import * as yaml from 'js-yaml';
import { DatabaseConfig, Database } from './database';
import { GraphQLAPIConfig, GraphQLAPI, Schema } from './graphql';

export interface DesolidConfig {
    api: GraphQLAPIConfig;
    datasource: DatabaseConfig;
}

export default class Desolid {
    protected config: DesolidConfig;
    protected database: Database;
    protected api: GraphQLAPI;
    protected schema: Schema;
    constructor(private readonly path: string) {
        this.config = yaml.safeLoad(readFileSync(`${path}/desolid.yaml`, { encoding: 'utf8' }));
        this.schema = new Schema(path);
        this.database = new Database(this.config.datasource, this.schema);
        this.api = new GraphQLAPI(this.config.api, this.schema);
    }
    public async start() {
        await this.database.start();
        await this.api.start();
    }
}
