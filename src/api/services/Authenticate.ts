import { AuthenticationError } from 'apollo-server-core';
import { arg, ObjectDefinitionBlock, NexusObjectTypeDef } from '@nexus/schema/dist/core';
import { GraphQLResolveInfo } from 'graphql';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import * as _ from 'lodash';
import { Model } from '../../database';
import { warn, log } from '../../utils';

export interface AuthenticationConfig {
    secret: string;
    /**
     * expiration time in hours
     */
    expiration: number;
}

export class Authenticate {
    private readonly config: AuthenticationConfig;

    private readonly defaultConfig: AuthenticationConfig = {
        secret: uuidv4(),
        expiration: 48, // hours
    };

    constructor(private readonly model: Model, config: AuthenticationConfig) {
        if (!config?.secret) {
            warn(
                `Authentication Secret value didn't set into the configuration file. the generated JWT tokens will expire on every restart.`,
            );
        }
        this.config = _.merge({}, this.defaultConfig, config);
    }

    public generateQueries(t: ObjectDefinitionBlock<'Query'>) {
        const args = this.model.typeDefinition.uniqueFields.reduce(
            (prev, value) => {
                prev[value.name] = arg({
                    type: value.typeName,
                    required: false,
                });
                return prev;
            },
            {
                password: arg({
                    type: 'Password',
                    required: true,
                }),
            },
        );
        t.field('authenticate', {
            type: this.model.typeDefinition.schema.get('AuthenticationPayload'),
            args,
            resolve: this.authenticate.bind(this),
        });
    }

    public generateMutations(t: ObjectDefinitionBlock<'Query'>) {}

    public get middleware() {
        return this._middleware.bind(this);
    }

    private async _middleware(resolve, root, args, context, info) {
        context.user = {};
        const token = context.request.get('Authorization');
        if (token) {
            try {
                const payload = jwt.verify(token.replace('Bearer ', ''), this.config.secret) as {
                    id: number;
                    exp: number;
                };
                context.user = await this.model.findOne({ id: payload.id });
            } catch (error) {
                if (error instanceof jwt.TokenExpiredError) {
                    return new AuthenticationError('JWT Token has been Expired.');
                } else {
                    return new AuthenticationError('Access denied.');
                }
            }
        }
        return resolve(root, args, context, info);
    }

    private async authenticate(root: any, credentials, context: any, info: GraphQLResolveInfo) {
        if (Object.keys(credentials).length < 2) {
            return new AuthenticationError(
                `Requires at least one of ${this.model.typeDefinition.uniqueFields
                    .map((field) => field.name)
                    .join(' or ')}.`,
            );
        }
        const user = await this.model.findOne(credentials);
        if (user) {
            return {
                user,
                token: jwt.sign({ id: user.id }, this.config.secret, {
                    algorithm: 'HS256',
                    expiresIn: `${this.config.expiration}h`,
                }),
            };
        } else {
            return new AuthenticationError('Not authorised');
        }
    }
}
