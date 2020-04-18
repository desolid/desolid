import { makeSchema, queryType, mutationType, intArg } from 'nexus';
import { ObjectDefinitionBlock } from 'nexus/dist/core';
import { GraphQLServer } from 'graphql-yoga';
import { Schema } from '.';
import { OrderBy, Input, CreateInput, UpdateInput, WhereInput, WhereUniqueInput } from '.';
import { CRUD } from './CRUD';
import { DesolidObjectTypeDef } from '../schema';

export interface GraphQLAPIConfig {
    port: number;
}

export class GraphQLAPI {
    private server: GraphQLServer;
    private cruds = new Map<string, CRUD>();

    constructor(protected config: GraphQLAPIConfig, modelTypeDefs: DesolidObjectTypeDef[]) {
        modelTypeDefs.forEach((typeDef: DesolidObjectTypeDef) => {
            this.cruds[typeDef.name] = new CRUD(typeDef);
        });
    }

    private generateSchema(outputs: any) {
        return makeSchema({
            types: [
                queryType({
                    definition: (t) => this.cruds.forEach(crud => crud.generateQuery(t)),
                }),
                mutationType({
                    definition: (t) => this.cruds.forEach(crud => crud.generateMutation(t)),
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
