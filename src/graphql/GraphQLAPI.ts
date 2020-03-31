import { makeSchema, queryType, mutationType, intArg } from 'nexus';
import { ObjectDefinitionBlock } from 'nexus/dist/core';
import { GraphQLServer } from 'graphql-yoga';
import { Schema } from '.';
import { Model, OrderBy, Input, CreateInput, UpdateInput, WhereInput, WhereUniqueInput } from './types';
import { CRUD } from './CRUD';

export interface GraphQLAPIConfig {
    port: number;
}

export class GraphQLAPI {
    private server: GraphQLServer;
    private cruds: { [model: string]: CRUD } = {};

    constructor(protected config: GraphQLAPIConfig, protected schema: Schema) {
        // creating cruds
        schema.models.forEach((model) => (this.cruds[model.name] = new CRUD(model)));
    }

    private generateSchema(outputs: any) {
        return makeSchema({
            types: [
                queryType({
                    definition: (t) => {
                        this.schema.models.forEach((model) => this.cruds[model.name].generateQuery(t));
                    },
                }),
                mutationType({
                    definition: (t) => {
                        this.schema.models.forEach((model) => this.cruds[model.name].generateMutation(t));
                    },
                }),
            ],
            outputs,
        });
    }

    public async start() {
        this.server = new GraphQLServer({
            schema: this.generateSchema({
                // typegen: __dirname + '/generated/typings.ts',
                // schema: __dirname + '/generated/schema.graphql',
            }),
        });
        await this.server.start({
            port: process.env.PORT || this.config.port || 3000,
        });
        console.log(`Server is running on http://localhost:${this.server.options.port}`);
    }
}
