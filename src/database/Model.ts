import { Sequelize, ModelCtor, IncludeOptions, Order, Op, BelongsToMany } from 'sequelize';
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
        typeDefinition.model = this;
    }

    public get name() {
        return this.schema.name;
    }

    private async createRelations(record, attributes) {
        const multiAssosiations = Object.values(this.datasource.associations).filter(
            (assossiation) => assossiation.isMultiAssociation,
        );
        return await Promise.all(
            multiAssosiations.map(async (assosiation: BelongsToMany) => {
                const input: string[] = attributes[assosiation.as];
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

    private async validateAssosiationInputs(attributes) {
        await Promise.all(
            Object.values(this.datasource.associations).map(async (assosiation) => {
                const input = attributes[assosiation.as];
                if (input) {
                    if (assosiation.isSingleAssociation) {
                        const record = await assosiation.target.findByPk(input);
                        if (!record) {
                            throw new Error(`Not found the '${assosiation.target.name}' where { id: '${input}' }.`);
                        }
                        attributes[assosiation.foreignKey] = input;
                        delete attributes[assosiation.as];
                    } else {
                        const records = await assosiation.target.findAll({
                            where: { id: { [Op.in]: input } },
                            attributes: ['id'],
                        });
                        (input as string[]).forEach((id) => {
                            if (!_.find(records, { id: id })) {
                                throw new Error(`Not found the '${assosiation.target.name}' where { id: '${id}' }.`);
                            }
                        });
                    }
                }
            }),
        );
    }

    public async createOne(data: any, attributes: string[], include: IncludeOptions[]) {
        // https://stackoverflow.com/a/49828917/2179157
        // https://stackoverflow.com/a/55765249/2179157
        // https://medium.com/@tonyangelo9707/many-to-many-associations-using-sequelize-941f0b6ac102
        // 1- validate relations exist
        await this.validateAssosiationInputs(data);
        // 2- create the record
        const record = await this.typeDefinition.model.datasource.create(data);
        // 3- create relations
        await this.createRelations(record, data);
        // 4- return the query
        return this.datasource.findByPk(record[this.datasource.primaryKeyAttribute], {
            attributes,
            include,
        });
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
