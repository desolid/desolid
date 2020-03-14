import { readFileSync } from 'fs-extra';
import * as yaml from 'js-yaml';
import gql from 'graphql-tag';
import { Model } from './entities/Model';
import { DatabaseConfig, Database } from './helpers/Database';
import { GraphQLAPIConfig, GraphQLAPI } from './helpers/GraphQLAPI';

export interface DesolidCongfig {
    database: DatabaseConfig;
    api: GraphQLAPIConfig;
}

export default class Desolid {
    protected config: DesolidCongfig;
    protected database: Database;
    protected api: GraphQLAPI;
    protected models: Model[];
    constructor(private readonly path: string) {
        this.config = yaml.safeLoad(readFileSync(`${path}/desolid.yaml`, { encoding: 'utf8' }));
        const { definitions } = gql(readFileSync(`${this.path}/schema.graphql`, { encoding: 'utf8' }));
        this.database = new Database(this.config.database);
        this.api = new GraphQLAPI(this.config.api);
        this.models = Model.import(definitions);
    }
    public async start() {
        await this.database.start(this.models);
        await this.api.start(this.models);
    }
}
