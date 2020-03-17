import { makeSchema, queryType, mutationType } from 'nexus';
import { GraphQLServer } from 'graphql-yoga';
import Model from '../entities/Model';

export interface GraphQLAPIConfig {
    port: number;
}
export class GraphQLAPI {
    constructor(protected config: GraphQLAPIConfig) {}
    public async start(models: readonly Model[]) {
        const schema = this.makeSchema(models);
        const server = new GraphQLServer({ schema });
        await server.start({
            port: process.env.PORT || this.config.port || 3000,
        });
        console.log(`Server is running on http://localhost:${server.options.port}`);
    }
    private makeSchema(models: readonly Model[]) {
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
}
