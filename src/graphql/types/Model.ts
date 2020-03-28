import { GraphQLResolveInfo } from 'graphql';
import * as graphqlFields from 'graphql-fields';
import { ObjectDefinitionBlock, intArg, idArg } from 'nexus/dist/core';
import { Repository } from 'typeorm';
import * as pluralize from 'pluralize';
import { Schema, TypeDefinition } from '..';
import { WhereInput, WhereUniqueInput, Type, OrderBy, CreateInput, UpdateInput } from '.';

interface FindArgs {
    where: any;
    orderBy: string;
    skip: number;
    limit: number;
}

export class Model extends Type {
    public repository: Repository<any>;
    private inputs: {
        where: WhereInput;
        uniqueWhere: WhereUniqueInput;
        create: CreateInput;
        update: UpdateInput;
    } = {} as any;
    constructor(definition: TypeDefinition, schema: Schema) {
        super(definition, schema, 'model');
        this.inputs.where = new WhereInput(this, schema);
        this.inputs.uniqueWhere = new WhereUniqueInput(this, schema);
        this.inputs.create = new CreateInput(this, schema);
        this.inputs.update = new UpdateInput(this, schema);
    }
    public setRepository(repository: Repository<any>) {
        this.repository = repository;
    }
    public getQueries(t: ObjectDefinitionBlock<string>) {
        t.field(this.name.toLowerCase(), {
            type: this,
            args: { where: this.inputs.uniqueWhere.toArg(true) },
            resolve: this.findOne.bind(this),
        });
        t.list.field(pluralize(this.name.toLowerCase()), {
            type: this,
            args: {
                where: this.inputs.where.toArg(true),
                orderBy: new OrderBy(this),
                skip: intArg(),
                limit: intArg(),
            },
            resolve: this.find.bind(this),
        });
    }

    public getMutations(t: ObjectDefinitionBlock<string>) {
        t.field(`create${this.name}`, {
            type: this,
            args: { data: this.inputs.create.toArg(true) },
            resolve: this.createOne.bind(this),
        });
        t.field(`createMany${this.name}`, {
            type: this,
            nullable: true,
            list: [true],
            args: { data: this.inputs.create.toArg(true, [true]) },
            resolve: this.createMany.bind(this),
        });
        t.field(`update${this.name}`, {
            type: this,
            nullable: true,
            args: { where: this.inputs.uniqueWhere.toArg(true), data: this.inputs.update.toArg(true) },
            resolve: this.updateOne.bind(this),
        });
        t.list.field(`updateMany${pluralize(this.name)}`, {
            type: this,
            nullable: true,
            args: { where: this.inputs.where.toArg(true), data: this.inputs.update.toArg(true) },
            resolve: this.updateMany.bind(this),
        });
        t.field(`delete${this.name}`, {
            type: this,
            nullable: true,
            args: { where: this.inputs.uniqueWhere.toArg(true) },
            resolve: this.deleteOne.bind(this),
        });
        t.list.field(`deleteMany${pluralize(this.name)}`, {
            type: this,
            nullable: true,
            args: { where: this.inputs.where.toArg(true) },
            resolve: this.deleteMany.bind(this),
        });
    }
    private async createOne(root: any, { data }: any, context: any, info: GraphQLResolveInfo) {
        return await this.repository.save({ ...data });
    }
    private async createMany(root: any, { data }: { data: any[] }, context: any, info: GraphQLResolveInfo) {
        return await this.repository.save(data.map((item) => ({ ...item })));
    }
    private async updateOne(root: any, { data, where }: any, context: any, info: GraphQLResolveInfo) {
        debugger;
    }
    private async updateMany(root: any, { data, where }: any, context: any, info: GraphQLResolveInfo) {
        debugger;
    }
    private async deleteOne(root: any, { where }: any, context: any, info: GraphQLResolveInfo) {
        debugger;
    }
    private async deleteMany(root: any, { where }: any, context: any, info: GraphQLResolveInfo) {
        debugger;
    }
    private async find(root: any, { where, orderBy, skip, limit }: FindArgs, context: any, info: GraphQLResolveInfo) {
        const select = Object.keys(graphqlFields(info));
        const order = orderBy ? { [orderBy.split('_')[0]]: orderBy.split('_')[1] as 'ASC' | 'DESC' } : undefined;
        return await this.repository.find({
            where: { ...where },
            select,
            skip,
            order,
            take: limit,
        });
    }
    private async findOne(root: any, { where }: any, context: any, info: GraphQLResolveInfo) {
        const select = Object.keys(graphqlFields(info));
        return await this.repository.findOne({ ...where }, { select });
    }
}