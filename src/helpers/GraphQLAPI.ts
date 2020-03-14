import { makeSchema, queryType, mutationType } from 'nexus';
import { Model } from 'src/entities/Model';
import { GraphQLServer } from 'graphql-yoga';

export interface GraphQLAPIConfig {
    port: number;
}
export class GraphQLAPI {
    constructor(protected config: GraphQLAPIConfig) {}
    private makeSchema(models: Model[]) {
        return makeSchema({
            types: [
                queryType({
                    definition(t) {
                        models.forEach((model) => model.generateQueries(t));
                    },
                }),
                mutationType({
                    definition(t) {
                        models.forEach((model) => model.generateMutations(t));
                    },
                }),
            ],
            outputs: {},
        });
    }
    public async start(models: Model[]) {
        const server = new GraphQLServer({
            schema: this.makeSchema(models),
        });
        await server.start({
            port: process.env.PORT || this.config.port || 3000,
        });
        console.log(`Server is running on http://localhost:${server.options.port}`);
    }
}
