import { ObjectDefinitionBlock, intArg } from 'nexus/dist/core';
import * as flat from 'flat';
import * as pluralize from 'pluralize';
import * as graphqlFields from 'graphql-fields';
import { Model, CreateInput, UpdateInput, WhereInput, WhereUniqueInput, OrderBy, Type } from './types';
import { GraphQLResolveInfo } from 'graphql';

export interface FindArgs {
    where: any;
    orderBy: string;
    skip: number;
    limit: number;
}

/**
 * @todo select relations
 */
export class CRUD {
    private inputs: {
        create: CreateInput;
        update: UpdateInput;
        where: WhereInput;
        whereUnique: WhereUniqueInput;
        orderBy: OrderBy;
    } = {} as any;

    constructor(private model: Model) {
        this.inputs.create = new CreateInput(model);
        this.inputs.update = new UpdateInput(model);
        this.inputs.where = new WhereInput(model);
        this.inputs.whereUnique = new WhereUniqueInput(model);
        this.inputs.orderBy = new OrderBy(model);
    }

    public generateQuery(t: ObjectDefinitionBlock<'Query'>) {
        t.field(this.model.name.toLowerCase(), {
            type: this.model,
            args: { where: this.inputs.whereUnique.toArg(true) },
            resolve: this.findOne.bind(this),
        });
        t.list.field(pluralize(this.model.name.toLowerCase()), {
            type: this.model,
            args: {
                where: this.inputs.where.toArg(false),
                orderBy: this.inputs.orderBy,
                skip: intArg(),
                limit: intArg(),
            },
            resolve: this.find.bind(this),
        });
    }

    public generateMutation(t: ObjectDefinitionBlock<'Mutation'>) {
        t.field(`create${this.model.name}`, {
            type: this.model,
            args: { data: this.inputs.create.toArg(true) },
            resolve: this.createOne.bind(this),
        });
        t.list.field(`createMany${this.model.name}`, {
            type: this.model,
            args: { data: this.inputs.create.toArg(true, [true]) },
            resolve: this.createMany.bind(this),
        });
        t.field(`update${this.model.name}`, {
            type: this.model,
            args: {
                where: this.inputs.whereUnique.toArg(true),
                data: this.inputs.update.toArg(true),
            },
            resolve: this.updateOne.bind(this),
        });
        t.field(`updateMany${pluralize(this.model.name)}`, {
            type: this.model.schema.dictionary.get('BatchPayload') as Type,
            args: {
                where: this.inputs.where.toArg(true),
                data: this.inputs.update.toArg(true),
            },
            resolve: this.updateMany.bind(this),
        });
        t.field(`delete${this.model.name}`, {
            type: this.model,
            args: { where: this.inputs.whereUnique.toArg(true) },
            resolve: this.deleteOne.bind(this),
        });
        t.field(`deleteMany${pluralize(this.model.name)}`, {
            type: this.model.schema.dictionary.get('BatchPayload') as Type,
            args: { where: this.inputs.where.toArg(true) },
            resolve: this.deleteMany.bind(this),
        });
    }

    private async createOne(root: any, { data }: any, context: any, info: GraphQLResolveInfo) {
        return this.model.createOne({ ...data });
    }

    private async createMany(root: any, { data }: { data: any[] }, context: any, info: GraphQLResolveInfo) {
        return this.model.createMany(data);
    }

    private async updateOne(root: any, { data, where }: any, context: any, info: GraphQLResolveInfo) {
        await this.model.update(data, where);
        return this.model.findOne(undefined, where);
    }

    private async updateMany(root: any, { data, where }: any, context: any, info: GraphQLResolveInfo) {
        return { count: await this.model.update(data, where) };
    }

    private async deleteOne(root: any, { where }: any, context: any, info: GraphQLResolveInfo) {
        const entry = await this.model.findOne(undefined, where);
        await this.model.delete(where);
        return entry;
    }

    private async deleteMany(root: any, { where }: any, context: any, info: GraphQLResolveInfo) {
        return { count: await this.model.delete(where) };
    }

    private async find(root: any, { where, orderBy, skip, limit }: FindArgs, context: any, info: GraphQLResolveInfo) {
        return await this.model.find(
            this.inputs.where.parse(where),
            Object.keys(flat(graphqlFields(info))),
            this.inputs.orderBy.parse(orderBy),
            skip,
            limit,
        );
    }

    private async findOne(root: any, { where }: any, context: any, info: GraphQLResolveInfo) {
        const select = Object.keys(graphqlFields(info));
        return await this.model.findOne(select, { ...where });
    }
}
