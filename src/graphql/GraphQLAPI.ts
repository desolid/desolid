import { makeSchema, queryType, mutationType } from '@nexus/schema/dist/core';
import { GraphQLServer } from 'graphql-yoga';
import { TypeDefinition, scalars } from '../schema';
import { Model } from '../database';
import { CRUD } from '.';

export interface GraphQLAPIConfig {
    port: number;
}

export class GraphQLAPI {
    private server: GraphQLServer;
    private cruds = new Map<string, CRUD>();

    constructor(protected config: GraphQLAPIConfig, models: Map<string, Model>) {
        models.forEach((model) => {
            this.cruds.set(model.name, new CRUD(model));
        });
    }

    private generateSchema(outputs: any) {
        return makeSchema({
            types: [
                ...scalars,
                queryType({
                    definition: (t) => this.cruds.forEach((crud) => crud.generateQuery(t)),
                }),
                mutationType({
                    definition: (t) => this.cruds.forEach((crud) => crud.generateMutation(t)),
                }),
            ],
            outputs,
        });
    }

    public async start() {
        const schema = this.generateSchema({
            // typegen: __dirname + '/generated/typings.ts',
            // schema: __dirname + '/generated/schema.graphql',
        });
        this.server = new GraphQLServer({ schema });
        await this.server.start({
            port: process.env.PORT || this.config.port || 3000,
        });
        console.log(`Server is running on http://localhost:${this.server.options.port}`);
    }
}
