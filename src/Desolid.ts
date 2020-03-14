import { readFileSync } from 'fs-extra';
import * as yaml from 'js-yaml';
import gql from 'graphql-tag';
import { queryType, mutationType, makeSchema } from 'nexus';
import { DatabaseConfig, Database } from './helpers/Database';
import { GraphQLAPIConfig, GraphQLAPI } from './helpers/GraphQLAPI';
import { Model } from './entities/Model';
import { ModelQuery } from './helpers/ModelQuery';
import { ModelMutation } from './helpers/ModelMutation';

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
        const schema = this.makeSchema(models);
        await this.database.start(models);
        await this.api.start(schema);
    }
    private makeSchema(models: Model[]) {
        return makeSchema({
            types: [
                queryType({
                    definition(t) {
                        models.forEach((model) => new ModelQuery(model, t));
                    },
                }),
                mutationType({
                    definition(t) {
                        models.forEach((model) => new ModelMutation(model, t));
                    },
                }),
            ],
            outputs: {
                // typegen: __dirname + '/generated/typings.ts',
                // schema: __dirname + '/generated/schema.graphql',
            },
        });
    }
}
