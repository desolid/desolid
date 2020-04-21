import { makeSchema, queryType, mutationType } from 'nexus';
import { GraphQLServer } from 'graphql-yoga';
import { CRUD } from './CRUD';
import { TypeDefinition } from 'src/schema';

export interface GraphQLAPIConfig {
    port: number;
}

export class GraphQLAPI {
    private server: GraphQLServer;
    private cruds = new Map<string, CRUD>();

    constructor(protected config: GraphQLAPIConfig, modelTypeDefs: TypeDefinition[]) {
        modelTypeDefs.forEach((typeDef: TypeDefinition) => {
            this.cruds.set(typeDef.name, new CRUD(typeDef));
        });
    }

    private generateSchema(outputs: any) {
        return makeSchema({
            types: [
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
