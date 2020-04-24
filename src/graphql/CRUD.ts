import { ObjectDefinitionBlock, intArg } from '@nexus/schema/dist/core';
import { GraphQLResolveInfo } from 'graphql';
import * as pluralize from 'pluralize';
import * as _ from 'lodash';
import {
    parseResolveInfo,
    simplifyParsedResolveInfoFragmentWithType,
    ResolveTree,
    FieldsByTypeName,
} from 'graphql-parse-resolve-info';
import { Op, IncludeOptions } from 'sequelize';
import { CreateInput, UpdateInput, WhereInput, WhereUniqueInput, OrderBy } from './input-archetypes';
import { TypeDefinition } from '../schema';

export interface FindArgs {
    where: any;
    orderBy: string;
    offset: number;
    limit: number;
}

export interface SelectAttributes {
    attributes: {};
    name: string;
    alias: string;
    args: {
        [str: string]: any;
    };
    fieldsByTypeName: FieldsByTypeName;
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

    constructor(private typeDefinition: TypeDefinition) {
        this.inputs.create = new CreateInput(typeDefinition);
        this.inputs.update = new UpdateInput(typeDefinition);
        this.inputs.where = new WhereInput(typeDefinition);
        this.inputs.whereUnique = new WhereUniqueInput(typeDefinition);
        this.inputs.orderBy = new OrderBy(typeDefinition);
    }

    public generateQuery(t: ObjectDefinitionBlock<'Query'>) {
        t.field(this.typeDefinition.name.toLowerCase(), {
            type: this.typeDefinition,
            args: { where: this.inputs.whereUnique.toArg(true) },
            resolve: this.findOne.bind(this),
        });
        t.list.field(pluralize(this.typeDefinition.name.toLowerCase()), {
            type: this.typeDefinition,
            args: {
                where: this.inputs.where.toArg(false),
                orderBy: this.inputs.orderBy,
                offset: intArg(),
                limit: intArg(),
            },
            resolve: this.find.bind(this),
        });
    }

    public generateMutation(t: ObjectDefinitionBlock<'Mutation'>) {
        t.field(`create${this.typeDefinition.name}`, {
            type: this.typeDefinition,
            args: { data: this.inputs.create.toArg(true) },
            resolve: this.createOne.bind(this),
        });
        t.list.field(`createMany${this.typeDefinition.name}`, {
            type: this.typeDefinition,
            args: { data: this.inputs.create.toArg(true, [true]) },
            resolve: this.createMany.bind(this),
        });
        t.field(`update${this.typeDefinition.name}`, {
            type: this.typeDefinition,
            args: {
                where: this.inputs.whereUnique.toArg(true),
                data: this.inputs.update.toArg(true),
            },
            resolve: this.updateOne.bind(this),
        });
        t.field(`updateMany${pluralize(this.typeDefinition.name)}`, {
            type: this.typeDefinition.schema.get('BatchPayload'),
            args: {
                where: this.inputs.where.toArg(true),
                data: this.inputs.update.toArg(true),
            },
            resolve: this.updateMany.bind(this),
        });
        t.field(`delete${this.typeDefinition.name}`, {
            type: this.typeDefinition,
            args: { where: this.inputs.whereUnique.toArg(true) },
            resolve: this.deleteOne.bind(this),
        });
        t.field(`deleteMany${pluralize(this.typeDefinition.name)}`, {
            type: this.typeDefinition.schema.get('BatchPayload'),
            args: { where: this.inputs.where.toArg(true) },
            resolve: this.deleteMany.bind(this),
        });
    }

    /**
     *
     * @param select
     * @todo handle where on relations: https://stackoverflow.com/a/36391912/2179157
     *          https://gist.github.com/zcaceres/83b554ee08726a734088d90d455bc566#customized-include-with-alias-and-where
     */
    private parseSelectAttributes(select: { [key: string]: SelectAttributes }) {
        const attributes: string[] = [];
        const include: IncludeOptions[] = [];
        for (let [name, attribute] of Object.entries<SelectAttributes>(select)) {
            const [modelName] = Object.keys(attribute.fieldsByTypeName);
            if (modelName) {
                const options = {
                    ...this.parseSelectAttributes(attribute.fieldsByTypeName[modelName] as any),
                } as IncludeOptions;
                options.model = this.typeDefinition.schema.get(modelName).model.datasource;
                options.as = attribute.name;
                include.push(options);
            } else {
                attributes.push(name);
            }
        }
        return { attributes, include };
    }

    private parseResolveInfo(info: GraphQLResolveInfo) {
        const { fields } = simplifyParsedResolveInfoFragmentWithType(
            parseResolveInfo(info) as ResolveTree,
            info.returnType,
        );
        return this.parseSelectAttributes(fields);
    }

    private async createOne(root: any, { data }: any, context: any, info: GraphQLResolveInfo) {
        const { attributes, include } = this.parseResolveInfo(info);
        return this.typeDefinition.model.createOne(data, attributes, include);
    }

    private async createMany(root: any, { data }: { data: any[] }, context: any, info: GraphQLResolveInfo) {
        const { attributes, include } = this.parseResolveInfo(info);
        // return this.model.datasource.createMany(data);
    }

    private async updateOne(root: any, { data, where }: any, context: any, info: GraphQLResolveInfo) {
        const { attributes, include } = this.parseResolveInfo(info);
        // await this.model.datasource.update(data, where);
        // return this.model.datasource.findOne(undefined, where);
    }

    private async updateMany(root: any, { data, where }: any, context: any, info: GraphQLResolveInfo) {
        const { attributes, include } = this.parseResolveInfo(info);
        // return { count: await this.model.datasource.update(data, where) };
    }

    private async deleteOne(root: any, { where }: any, context: any, info: GraphQLResolveInfo) {
        const { attributes, include } = this.parseResolveInfo(info);
        // const entry = await this.model.datasource.findOne(undefined, where);
        // await this.model.datasource.delete(where);
        // return entry;
    }

    private async deleteMany(root: any, { where }: any, context: any, info: GraphQLResolveInfo) {
        const { attributes, include } = this.parseResolveInfo(info);
        // return { count: await this.model.datasource.delete(where) };
    }

    private async find(root: any, { where, orderBy, offset, limit }: FindArgs, context: any, info: GraphQLResolveInfo) {
        const { attributes, include } = this.parseResolveInfo(info);
        return this.typeDefinition.model.findAll(
            this.inputs.where.parse(where),
            attributes,
            include,
            this.inputs.orderBy.parse(orderBy),
            limit,
            offset,
        );
    }

    private async findOne(root: any, { where }: any, context: any, info: GraphQLResolveInfo) {
        const { attributes, include } = this.parseResolveInfo(info);
        return this.typeDefinition.model.findOne(where, attributes, include);
    }
}
