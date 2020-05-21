import { makeSchema, queryType, mutationType } from '@nexus/schema/dist/core';
import { GraphQLServer } from 'graphql-yoga';
import * as _ from 'lodash';
import { scalars } from '../schema';
import { Model } from '../database';
import { Storage } from '../storage';
import { MapX, log } from '../utils';
import { CRUD, Authenticate, AuthenticationConfig, UserAuthorization } from '.';

export interface GraphQLAPIConfig {
    port: number;
    authentication: AuthenticationConfig;
    upload: {
        maxFileSize: number;
    };
}

export class GraphQLAPI {
    private readonly defaultConfig: GraphQLAPIConfig = {
        port: 3000,
        authentication: undefined,
        upload: {
            maxFileSize: 64, //MB
        },
    };
    private readonly config: GraphQLAPIConfig;
    private readonly cruds = new MapX<string, CRUD>();
    private readonly authenticate: Authenticate;
    private server: GraphQLServer;

    constructor(config: GraphQLAPIConfig, models: MapX<string, Model>, private readonly storage: Storage) {
        this.config = _.merge({}, this.defaultConfig, config);
        this.authenticate = new Authenticate(models.get('User'), this.config.authentication);
        models.forEach((model) => {
            switch (model.name) {
                case 'User':
                    this.cruds.set(model.name, new CRUD(model, new UserAuthorization(model)));
                    break;
                default:
                    this.cruds.set(model.name, new CRUD(model));
                    break;
            }
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
                        this.cruds.forEach((crud) => crud.generateMutations(t));
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
            middlewares: [this.authenticate.middleware, this.storage.middleware],
            context: (req) => ({ ...req }),
        });
        const maxFileSize = this.config.upload?.maxFileSize || 64;
        await this.server.start({
            port: process.env.PORT || this.config.port || 3000,
            uploads: {
                maxFileSize: maxFileSize * Math.pow(1024, 2), //MB
            },
        });
        log(`Server is running on http://localhost:${this.server.options.port}`);
    }
}
