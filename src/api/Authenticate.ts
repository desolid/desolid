import { AuthenticationError } from 'apollo-server-core';
import { Model } from '../database';
import * as jwt from 'jsonwebtoken';
import { arg, ObjectDefinitionBlock, NexusObjectTypeDef } from '@nexus/schema/dist/core';
import { GraphQLResolveInfo } from 'graphql';

export class Authenticate {
    constructor(private readonly model: Model, private readonly secret: string) {
        this.secret = this.secret || 'secret';
    }

    public generateQueries(t: ObjectDefinitionBlock<'Query'>) {
        t.field('signin', {
            type: this.model.typeDefinition.schema.dictionary.get('AuthenticationPayload') as NexusObjectTypeDef<any>,
            args: {
                email: arg({
                    type: 'String',
                    required: true,
                }),
                password: arg({
                    type: 'Password',
                    required: true,
                }),
            },
            resolve: this.signin.bind(this),
        });
    }

    public generateMutations(t: ObjectDefinitionBlock<'Query'>) {
        t.field('signup', {
            type: this.model.typeDefinition.schema.dictionary.get('AuthenticationPayload') as NexusObjectTypeDef<any>,
            args: {
                name: arg({
                    type: 'String',
                    required: true,
                }),
                email: arg({
                    type: 'String',
                    required: true,
                }),
                password: arg({
                    type: 'Password',
                    required: true,
                }),
            },
            resolve: this.signup.bind(this),
        });
    }

    public get middleware() {
        return this._middleware.bind(this);
    }

    private async _middleware(resolve, root, args, context, info) {
        context.user = {};
        try {
            const token = jwt.verify(context.request.get('Authorization'), this.secret) as {
                id: string;
                email: string;
            };
            context.user = await this.model.findOne({ id: token.id });
        } catch (e) {
            // return new AuthenticationError('Not authorised');
        }
        return resolve(root, args, context, info);
    }

    private async signup(root: any, { name, email, password }, context: any, info: GraphQLResolveInfo) {
        const user = await this.model.createOne({ name, email, password, group: 'User' });
        return {
            user,
            token: jwt.sign({ id: user.id, email }, this.secret, { algorithm: 'HS256' }),
        };
    }

    private async signin(root: any, { email, password }, context: any, info: GraphQLResolveInfo) {
        const user = await this.model.findOne({ email, password });
        if (user) {
            return {
                user,
                token: jwt.sign({ id: user.id, email }, this.secret, { algorithm: 'HS256' }),
            };
        } else {
            return new AuthenticationError('Not authorised');
        }
    }
}
