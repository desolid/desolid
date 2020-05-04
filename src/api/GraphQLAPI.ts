import { makeSchema, queryType, mutationType } from '@nexus/schema/dist/core';
import { GraphQLServer } from 'graphql-yoga';
import { scalars } from '../schema';
import { Model } from '../database';
import { CRUD, Authenticate } from '.';

export interface GraphQLAPIConfig {
    port: number;
    secret: string;
}

export class GraphQLAPI {
    private server: GraphQLServer;
    private cruds = new Map<string, CRUD>();
    private authenticate: Authenticate;

    constructor(protected config: GraphQLAPIConfig, models: Map<string, Model>) {
        this.authenticate = new Authenticate(models.get('User'), this.config.secret);
        models.forEach((model) => {
            this.cruds.set(model.name, new CRUD(model));
        });
    }

    private generateSchema(outputs: any) {
        return makeSchema({
            types: [
                ...scalars,
                queryType({
                    definition: (t) => {
                        this.authenticate.generateQueries(t);
                        this.cruds.forEach((crud) => crud.generateQueries(t));
                    },
                }),
                mutationType({
                    definition: (t) => {
                        this.authenticate.generateMutations(t);
                        this.cruds.forEach((crud) => crud.generateMutations(t))
                    },
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
        this.server = new GraphQLServer({
            schema,
            middlewares: [this.authenticate.middleware],
            context: (req) => ({ ...req }),
        });
        await this.server.start({
            port: process.env.PORT || this.config.port || 3000,
        });
        console.log(`Server is running on http://localhost:${this.server.options.port}`);
    }
}
