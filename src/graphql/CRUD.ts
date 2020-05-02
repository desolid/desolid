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
import { IncludeOptions } from 'sequelize';
import { CreateOneInput as CreateInput, UpdateInput, WhereInput, WhereUniqueInput, OrderBy } from '.';
import { Model } from '../database';

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
 * @todo finish CRUDS
 */
export class CRUD {
    private readonly inputs: {
        create: CreateInput;
        update: UpdateInput;
        where: WhereInput;
        whereUnique: WhereUniqueInput;
        orderBy: OrderBy;
    } = {} as any;

    constructor(private model: Model) {
        this.inputs.create = new CreateInput(model);
        this.inputs.update = new UpdateInput(model);
        this.inputs.where = new WhereInput(model.typeDefinition);
        this.inputs.whereUnique = new WhereUniqueInput(model.typeDefinition);
        this.inputs.orderBy = new OrderBy(model.typeDefinition);
    }

    public generateQuery(t: ObjectDefinitionBlock<'Query'>) {
        t.field(this.model.name.toLowerCase(), {
            type: this.model.typeDefinition,
            args: { where: this.inputs.whereUnique.toArg(true) },
            resolve: this.findOne.bind(this),
        });
        t.list.field(pluralize(this.model.name.toLowerCase()), {
            type: this.model.typeDefinition,
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
        t.field(`create${this.model.name}`, {
            type: this.model.typeDefinition,
            args: { data: this.inputs.create.toArg(true) },
            resolve: this.createOne.bind(this),
        });

        t.list.field(`createMany${this.model.name}`, {
            type: this.model.typeDefinition,
            args: { data: this.inputs.create.toArg(true, [true]) },
            resolve: this.createMany.bind(this),
        });

        t.field(`update${this.model.name}`, {
            type: this.model.typeDefinition,
            args: {
                where: this.inputs.whereUnique.toArg(true),
                data: this.inputs.update.toArg(true),
            },
            resolve: this.updateOne.bind(this),
        });

        t.field(`updateMany${pluralize(this.model.name)}`, {
            type: this.model.typeDefinition.schema.get('BatchPayload'),
            args: {
                where: this.inputs.where.toArg(true),
                data: this.inputs.update.toArg(true),
            },
            resolve: this.updateMany.bind(this),
        });

        t.field(`delete${this.model.name}`, {
            type: this.model.typeDefinition,
            args: { where: this.inputs.whereUnique.toArg(true) },
            resolve: this.deleteOne.bind(this),
        });

        t.field(`deleteMany${pluralize(this.model.name)}`, {
            type: this.model.typeDefinition.schema.get('BatchPayload'),
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
            if (modelName && this.model.datasource.associations[attribute.name]) {
                include.push({
                    association: attribute.name,
                    ...this.parseSelectAttributes(attribute.fieldsByTypeName[modelName] as any),
                });
            } else {
                attributes.push(name);
            }
        }
        return { attributes, include };
    }

    private parseResolveInfo(info: GraphQLResolveInfo) {
        return this.parseSelectAttributes(
            simplifyParsedResolveInfoFragmentWithType(parseResolveInfo(info) as ResolveTree, info.returnType).fields,
        );
    }

    private async createOne(root: any, { data }: any, context: any, info: GraphQLResolveInfo) {
        const { attributes, include } = this.parseResolveInfo(info);
        await this.inputs.create.validate(data);
        return this.model.createOne(data, attributes, include);
    }

    private async createMany(root: any, { data }: { data: any[] }, context: any, info: GraphQLResolveInfo) {
        const { attributes, include } = this.parseResolveInfo(info);
        await Promise.all(data.map((item) => this.inputs.create.validate(item)));
        return this.model.createMany(data, attributes, include);
    }

    private async updateOne(root: any, { data, where }: any, context: any, info: GraphQLResolveInfo) {
        const { attributes, include } = this.parseResolveInfo(info);
        const record = await this.model.findOne(where, ['id'], []);
        await this.inputs.update.validate(data, record);
        return this.model.updateOne(where /** WhereUniqueInput */, data, attributes, include, record);
    }

    private async updateMany(root: any, { data, where }: any, context: any, info: GraphQLResolveInfo) {
        const { attributes, include } = this.parseResolveInfo(info);
        const records = await this.model.findAll(where, ['id']);
        await Promise.all(records.map((record) => this.inputs.update.validate(data, record)));
        return this.model.updateMany(
            this.inputs.where.parse(where) /** WhereInput */,
            data,
            attributes,
            include,
            records,
        );
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
        return this.model.findAll(
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
        const result = await this.model.findOne(where, attributes, include);
        if (!result) {
            throw new Error(`Not found.`);
        } else {
            return result;
        }
    }
}
