import { makeSchema, queryType, mutationType } from 'nexus';
import { GraphQLServer } from 'graphql-yoga';
import { Model } from '.';
import { Schema } from './Schema';

export interface GraphQLAPIConfig {
    port: number;
}
export class GraphQLAPI {
    private server: GraphQLServer;
    constructor(protected config: GraphQLAPIConfig, protected schema: Schema) {
        this.server = new GraphQLServer({ schema: this.generateSchema(schema.models) });
    }
    private generateSchema(models: readonly Model[]) {
        return makeSchema({
            types: [
                queryType({
                    definition(t) {
                        models.forEach((model) => model.getQueries(t));
                    },
                }),
                mutationType({
                    definition(t) {
                        models.forEach((model) => model.getMutations(t));
                    },
                }),
            ],
            outputs: {
                // typegen: __dirname + '/generated/typings.ts',
                // schema: __dirname + '/generated/schema.graphql',
            },
        });
    }
    public async start() {
        await this.server.start({
            port: process.env.PORT || this.config.port || 3000,
        });
        console.log(`Server is running on http://localhost:${this.server.options.port}`);
    }
}
