import { Sequelize, ModelCtor, IncludeOptions, Order, Op, BelongsToMany, Association } from 'sequelize';
import * as _ from 'lodash';
import { ModelSchema } from '.';
import { TypeDefinition } from '../schema';

export class Model {
    public readonly datasource: ModelCtor<any>;
    public readonly schema: ModelSchema;
    constructor(database: Sequelize, public readonly typeDefinition: TypeDefinition) {
        this.schema = new ModelSchema(typeDefinition);
        this.datasource = database.define(
            this.typeDefinition.name,
            this.schema.attributes,
            this.schema.options,
        ) as ModelCtor<any>;
    }

    public get name() {
        return this.schema.name;
    }

    private async createAssosiations(record, inputs) {
        const multiAssosiations = Object.values(this.datasource.associations).filter(
            (assossiation) => assossiation.isMultiAssociation,
        );
        return await Promise.all(
            multiAssosiations.map(async (assosiation: BelongsToMany) => {
                const input: string[] = inputs[assosiation.as];
                if (input) {
                    const entries = input.map((id) => {
                        return {
                            [assosiation.identifier]: record.id,
                            [assosiation.otherKey]: id,
                        };
                    });
                    return await (assosiation as any).throughModel.bulkCreate(entries);
                }
            }),
        );
    }

    public async assosiationExists(value: number | number[], assosiation: Association<any, any>) {
        if (value) {
            if (assosiation.isSingleAssociation) {
                const record = await assosiation.target.findByPk(value as number);
                if (!record) {
                    throw new Error(`Not found the '${assosiation.target.name}' where { id: '${value}' }.`);
                }
            } else {
                const records = await assosiation.target.findAll({
                    where: { id: { [Op.in]: value } },
                    attributes: ['id'],
                });
                (value as number[]).forEach((id) => {
                    if (!_.find(records, { id: id })) {
                        throw new Error(`Not found the '${assosiation.target.name}' where { id: '${id}' }.`);
                    }
                });
            }
        }
    }

    /**
     * @todo handle create/connect on relations
     */
    public async createOne(input: any, attributes: string[], include: IncludeOptions[]) {
        // https://stackoverflow.com/a/49828917/2179157
        // https://stackoverflow.com/a/55765249/2179157
        // https://medium.com/@tonyangelo9707/many-to-many-associations-using-sequelize-941f0b6ac102
        // 1- create the record
        const record = await this.datasource.create(input);
        // 2- create relations
        await this.createAssosiations(record, input);
        // 3- return the query
        return this.datasource.findByPk(record[this.datasource.primaryKeyAttribute], {
            attributes,
            include,
        });
    }

    /**
     *
     * @param inputs
     * @param attributes
     * @param include
     *
     * @todo 1: handle create/connect on relations
     * @todo could be more quick by bulk relation creatation
     */
    public async createMany(inputs: any[], attributes: string[], include: IncludeOptions[]) {
        // 1- create the records
        const records: any[] = await this.datasource.bulkCreate(inputs, { returning: ['id'] });
        // 2- create relations
        await Promise.all(records.map((record, index) => this.createAssosiations(record, inputs[index])));
        // 3- return the query
        return this.datasource.findAll({
            where: {
                id: records.map((record) => record.id),
            },
            attributes,
            include,
        });
    }

    public async deleteOne() {}

    /**
     * @todo 1: handle update on relations: create,connect,delete
     */
    public async updateOne(where: any, input: any, attributes: string[], include: IncludeOptions[]) {
        // 1- create the record
        const [affectedRows] = await this.datasource.update(input, { where });
        // 2- create relations
        // await this.createRelations(record, input);
        // 3- return the query
        return this.datasource.findOne({ where, attributes, include });
    }

    /**
     * @todo 1: handle update on relations: create,connect,delete
     */
    public async updateMany(where: any, input: any, attributes: string[], include: IncludeOptions[]) {
        const [affectedRows] = await this.datasource.update(input, { where });
        return { count: affectedRows };
    }

    public async findAll(
        where: any,
        attributes: string[],
        include: IncludeOptions[],
        order: Order,
        limit: number,
        offset: number,
    ) {
        return this.datasource.findAll({
            where,
            order,
            attributes,
            include,
            limit,
            offset,
        });
    }

    public async findOne(where: any, attributes: string[], include: IncludeOptions[]) {
        return this.datasource.findOne({ where, attributes, include });
    }
}
