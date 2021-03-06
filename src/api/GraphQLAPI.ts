import { makeSchema, queryType, mutationType } from '@nexus/schema/dist/core';
import { GraphQLServer } from 'graphql-yoga';
import * as express from 'express';
import * as path from 'path';
import * as _ from 'lodash';
import { scalars } from '../schema';
import { Model } from '../database';
import { Storage } from '../storage';
import { MapX, log } from '../utils';
import { CRUD, Authenticate, AuthenticationConfig, UserAuthorization, SystemInfo } from '.';

export interface GraphQLAPIConfig {
    deaf?: boolean;
    port?: number;
    authentication?: AuthenticationConfig;
    path?: string;
    upload?: {
        maxFileSize?: number;
    };
}

export class GraphQLAPI {
    private readonly defaultConfig: GraphQLAPIConfig = {
        deaf: false,
        port: 3000,
        path: '/graphql',
        authentication: undefined,
        upload: {
            maxFileSize: 64, //MB
        },
    };
    private readonly config: GraphQLAPIConfig;
    private readonly cruds = new MapX<string, CRUD>();
    private readonly authenticate: Authenticate;
    private readonly systemInfo: SystemInfo;
    private readonly userModel: Model;
    private server: GraphQLServer;

    constructor(
        config: GraphQLAPIConfig,
        private readonly models: MapX<string, Model>,
        private readonly storage: Storage,
    ) {
        this.config = _.merge({}, this.defaultConfig, config);
        this.userModel = models.get('User');
        this.authenticate = new Authenticate(this.userModel, this.config.authentication);
        this.systemInfo = new SystemInfo(this.userModel);
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
                this.userModel.typeDefinition.schema.get('Model'),
                this.userModel.typeDefinition.schema.get('Field'),
                queryType({
                    definition: (t) => {
                        this.systemInfo.generateQueries(t);
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
        // Serving Admin panel
        this.serveAdminPanel();
        const maxFileSize = this.config.upload?.maxFileSize || 64;
        const options = {
            endpoint: this.config.path,
            port: process.env.PORT || this.config.port || 3000,
            uploads: {
                maxFileSize: maxFileSize * Math.pow(1024, 2), //MB
            },
        };
        if (this.config.deaf) {
            await this.server.createHttpServer(options);
            log(`Server is running on deaf mod. see documentation for more info;`);
        } else {
            // runMiddleware(this.server.express);
            // Starting the server
            await this.server.start(options);
            log(`Server is running on http://localhost:${this.server.options.port}`);
            log(`Amin panel is available on http://localhost:${this.server.options.port}/admin`);
        }
    }

    public async request(req: Request, res: Response, next: Function) {
        return this.server.express._router.handle(req, res, next);
    }

    private serveAdminPanel() {
        const desolidAdminPath = path.join(__dirname, '../../node_modules/desolid-admin/dist');
        this.server.express.use('/admin', express.static(desolidAdminPath));
        this.server.express.use('/admin', function(req, res, next) {
            res.sendFile(`${desolidAdminPath}/index.html`);
        });
    }
}
