import { readFileSync } from 'fs-extra';
import * as yaml from 'js-yaml';
import gql from 'graphql-tag';
import { DatabaseConfig, Database } from './helpers/Database';
import { GraphQLAPIConfig, GraphQLAPI } from './helpers/GraphQLAPI';
import Model from './entities/Model';

export interface DesolidConfig {
    api: GraphQLAPIConfig;
    datasource: DatabaseConfig;
}

export default class Desolid {
    protected config: DesolidConfig;
    protected database: Database;
    protected api: GraphQLAPI;
    constructor(private readonly path: string) {
        this.config = yaml.safeLoad(readFileSync(`${path}/desolid.yaml`, { encoding: 'utf8' }));
        this.database = new Database(this.config.datasource);
        this.api = new GraphQLAPI(this.config.api);
    }
    public async start() {
        const { definitions } = gql(readFileSync(`${this.path}/schema.graphql`, { encoding: 'utf8' }));
        const models = Model.import(definitions);
        await this.database.start(models);
        await this.api.start(models);
    }
}
