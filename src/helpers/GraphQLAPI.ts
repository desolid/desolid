import { makeSchema, queryType, mutationType } from 'nexus';
import { GraphQLServer } from 'graphql-yoga';
import { GraphQLSchema } from 'graphql';

export interface GraphQLAPIConfig {
    port: number;
}
export class GraphQLAPI {
    constructor(protected config: GraphQLAPIConfig) {}
    public async start(schema: GraphQLSchema) {
        const server = new GraphQLServer({ schema });
        await server.start({
            port: process.env.PORT || this.config.port || 3000,
        });
        console.log(`Server is running on http://localhost:${server.options.port}`);
    }
}
