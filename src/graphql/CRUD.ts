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
import { Includeable, Op } from 'sequelize';
import { CreateInput, UpdateInput, WhereInput, WhereUniqueInput, OrderBy } from './input-archetypes';
import { TypeDefinition, FieldDefinition } from '../schema';

export interface FindArgs {
    where: any;
    orderBy: string;
    offset: number;
    limit: number;
}

export interface SelectField {
    fields: {};
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

    constructor(private model: TypeDefinition) {
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
                offset: intArg(),
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
            type: this.model.schema.get('BatchPayload'),
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
            type: this.model.schema.get('BatchPayload'),
            args: { where: this.inputs.where.toArg(true) },
            resolve: this.deleteMany.bind(this),
        });
    }

    /**
     *
     * @param fields
     * @todo handle where on relations: https://stackoverflow.com/a/36391912/2179157
     */
    private parseSelectFields(fields: { [key: string]: SelectField }) {
        const attributes: string[] = [];
        const include: Includeable[] = [];
        for (let [name, field] of Object.entries<SelectField>(fields)) {
            const [modelName] = Object.keys(field.fieldsByTypeName);
            if (modelName) {
                const model = this.model.schema.get(modelName).datasource;
                include.push({ model, ...this.parseSelectFields(field.fieldsByTypeName[modelName] as any) });
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
        return this.parseSelectFields(fields);
    }

    private async validateRelationInputs(attributes) {
        await Promise.all(
            this.model.relations.map(async (field) => {
                const input = attributes[field.name];
                if (input) {
                    if (field.config.list) {
                        const records = await field.relation.model.datasource.findAll({
                            where: { id: { [Op.in]: input } },
                            attributes: ['id'],
                        });
                        (input as string[]).forEach((id) => {
                            if (!_.find(records, { id: parseInt(id) })) {
                                throw new Error(`Not found the ${field.relation.model.name} with [id:'${id}'].`);
                            }
                        });
                    } else {
                        const record = await field.relation.model.datasource.findByPk(input);
                        if (!record) {
                            throw new Error(`Not found the ${field.relation.model.name} with [id:'${input}'].`);
                        }
                    }
                }
            }),
        );
    }

    private async createRelations(record, attributes) {
        const fieldsToRelationTable = this.model.relations.filter((relation) => !relation.databaseType);
        await Promise.all(
            fieldsToRelationTable.map(async (field) => {
                const input: string[] = attributes[field.name];
                if (input) {
                    const relationTable = this.model.datasource.sequelize.models[field.relationTableName];
                    const entries = input.map((id) => {
                        return {
                            [`${field.owner.datasource.name}Id`]: record.id,
                            [`${field.relation.model.datasource.name}Id`]: id,
                        };
                    });
                    const result = await relationTable.bulkCreate(entries);
                }
            }),
        );
    }

    private async createOne(root: any, { data }: any, context: any, info: GraphQLResolveInfo) {
        // https://stackoverflow.com/a/49828917/2179157
        // https://stackoverflow.com/a/55765249/2179157
        // https://medium.com/@tonyangelo9707/many-to-many-associations-using-sequelize-941f0b6ac102
        const { attributes, include } = this.parseResolveInfo(info);
        // 1- Validate relations exist
        await this.validateRelationInputs(data);
        // 2- create the record
        const record = await this.model.datasource.create(data);
        // 3- create relations
        await this.createRelations(record, data);
        // 4- return the query
        return this.model.datasource.findByPk(record[this.model.datasource.primaryKeyAttribute], {
            attributes,
            include,
        });
    }

    private async createMany(root: any, { data }: { data: any[] }, context: any, info: GraphQLResolveInfo) {
        const { attributes, include } = this.parseResolveInfo(info);
        // return this.model.createMany(data);
    }

    private async updateOne(root: any, { data, where }: any, context: any, info: GraphQLResolveInfo) {
        const { attributes, include } = this.parseResolveInfo(info);
        // await this.model.update(data, where);
        // return this.model.findOne(undefined, where);
    }

    private async updateMany(root: any, { data, where }: any, context: any, info: GraphQLResolveInfo) {
        const { attributes, include } = this.parseResolveInfo(info);
        // return { count: await this.model.update(data, where) };
    }

    private async deleteOne(root: any, { where }: any, context: any, info: GraphQLResolveInfo) {
        const { attributes, include } = this.parseResolveInfo(info);
        // const entry = await this.model.findOne(undefined, where);
        // await this.model.delete(where);
        // return entry;
    }

    private async deleteMany(root: any, { where }: any, context: any, info: GraphQLResolveInfo) {
        const { attributes, include } = this.parseResolveInfo(info);
        // return { count: await this.model.delete(where) };
    }

    private async find(root: any, { where, orderBy, offset, limit }: FindArgs, context: any, info: GraphQLResolveInfo) {
        const { attributes, include } = this.parseResolveInfo(info);
        return this.model.datasource.findAll({
            where: this.inputs.where.parse(where),
            order: this.inputs.orderBy.parse(orderBy),
            attributes,
            include,
            limit,
            offset,
        });
    }

    private async findOne(root: any, { where }: any, context: any, info: GraphQLResolveInfo) {
        const { attributes, include } = this.parseResolveInfo(info);
        return this.model.datasource.findOne({ where, attributes, include });
    }
}
