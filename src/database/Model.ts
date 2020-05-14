import { Sequelize, ModelCtor, IncludeOptions, Order, Op, BelongsToMany, Association } from 'sequelize';
import * as _ from 'lodash';
import { ModelSchema } from '.';
import { TypeDefinition, FieldDefinition } from 'src/schema';
import { Storage, Upload } from 'src/storage';
import { MapX } from 'src/utils';

export interface Record {
    id: number;
    createdAt: Date;
    updatedAt: Date;
}

export class Model {
    public readonly datasource: ModelCtor<any>;
    public readonly schema: ModelSchema;
    public readonly relations: MapX<string, FieldDefinition>;
    public readonly files: MapX<string, FieldDefinition>;

    constructor(
        public readonly database: Sequelize,
        public readonly typeDefinition: TypeDefinition,
        public readonly storage: Storage,
    ) {
        this.schema = new ModelSchema(typeDefinition);
        this.datasource = database.define(
            this.typeDefinition.name,
            this.schema.attributes,
            this.schema.options,
        ) as ModelCtor<any>;
        this.relations = typeDefinition.fields.filter(
            (field) => !field.isScalar && (field.type as TypeDefinition).isModel,
        );
        this.files = this.relations.filter((field) => field.typeName == 'File');
    }

    public get name() {
        return this.schema.name;
    }

    public get fileModel() {
        return this.database.models.File;
    }

    private async createToManyAssosiations(record, inputs) {
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

    private async updateAssosiations(record, inputs) {
        const multiAssosiations = Object.values(this.datasource.associations).filter(
            (assossiation) => assossiation.isMultiAssociation,
        );
        return await Promise.all(
            multiAssosiations.map(async (assosiation: BelongsToMany) => {
                const { add, remove } = inputs[assosiation.as] as { add: number[]; remove: number[] };
                if (add) {
                    const entries = add.map((id) => {
                        return {
                            [assosiation.identifier]: record.id,
                            [assosiation.otherKey]: id,
                        };
                    });
                    await (assosiation as any).throughModel.bulkCreate(entries);
                }
                if (remove) {
                    const entries = remove.map((id) => {
                        return {
                            [assosiation.identifier]: record.id,
                            [assosiation.otherKey]: id,
                        };
                    });
                    await ((assosiation as any).throughModel as ModelCtor<any>).destroy({
                        where: { [Op.or]: entries },
                    });
                }
            }),
        );
    }

    public async assosiationSideExists(value: number | number[], assosiation: Association<any, any>) {
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
                // @todo chck trough table here
            }
        }
    }

    private async saveInputFiles(input) {
        // saving files
        const uploadInputs = this.files.filter((field) => input[field.name]);
        return Promise.all<string>(
            uploadInputs.map(async (field) => {
                const { filename, mimetype, buffer } = input[field.name];
                const path = await this.storage.save(input[field.name]);
                input[`${field.name}Id`] = this.fileModel
                    .create({
                        name: filename,
                        path,
                        mimetype,
                        size: buffer.length,
                    })
                    .then((res) => res.id as number);
                return (input[field.name].path = path);
            }),
        );
    }

    private async deleteInputFiles(input) {
        // deleting files
        const uploadInputs = this.files.filter((field) => input[field.name]);
        return Promise.all(
            uploadInputs.map(async (field) => {
                await this.fileModel.destroy({ where: { id: input[`${field.name}Id`] } });
                await this.storage.delete(input[field.name].path);
            }),
        );
    }

    /**
     * @todo handle create/connect on relations
     */
    public async createOne(input: any, attributes?: string[], include?: IncludeOptions[]) {
        // https://stackoverflow.com/a/49828917/2179157
        // https://stackoverflow.com/a/55765249/2179157
        // https://medium.com/@tonyangelo9707/many-to-many-associations-using-sequelize-941f0b6ac102
        // 0- save files
        const paths = await this.saveInputFiles(input);
        try {
            // 1- create the record
            const record = await this.datasource.create(input);
            // 2- create relations
            await this.createToManyAssosiations(record, input);
            // 3- return the query
            return this.datasource.findByPk(record[this.datasource.primaryKeyAttribute], {
                attributes,
                include,
            });
        } catch (error) {
            await this.deleteInputFiles(input);
            throw error;
        }
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
        await Promise.all(records.map((record, index) => this.createToManyAssosiations(record, inputs[index])));
        // 3- return the query
        return this.datasource.findAll({
            where: {
                id: records.map((record) => record.id),
            },
            attributes,
            include,
        });
    }

    public async deleteOne(where: any, attributes?: string[], include?: IncludeOptions[]) {
        return await this.datasource.destroy({ where });
    }

    public async deleteMany(where: any) {
        const affectedRows = await this.datasource.destroy({ where });
        return { count: affectedRows };
    }

    /**
     * @todo 1: handle update on relations: create,connect,delete
     */
    public async updateOne(
        where: any,
        input: any,
        attributes: string[],
        include: IncludeOptions[],
        record: { id: number },
    ) {
        // 1- create the record
        const [affectedRows] = await this.datasource.update(input, { where });
        // 2- create relations
        await this.updateAssosiations(record, input);
        // 3- return the query
        return this.datasource.findOne({ where, attributes, include });
    }

    /**
     * @todo 1: handle update on relations: create,connect,delete
     */
    public async updateMany(where: any, input: any, attributes: string[], include: IncludeOptions[], records: any[]) {
        // 1- create the record
        const [affectedRows] = await this.datasource.update(input, { where });
        // 2- create relations
        await Promise.all(records.map((record) => this.updateAssosiations(record, input)));
        // 3- return the query
        return { count: affectedRows };
    }

    public async findAll(
        where: any,
        attributes?: string[],
        include?: IncludeOptions[],
        order?: Order,
        limit?: number,
        offset?: number,
    ) {
        return this.datasource.findAll({
            where,
            order,
            attributes,
            include,
            limit,
            offset,
        }) as any[];
    }

    public async findOne(where: any, attributes?: string[], include?: IncludeOptions[]) {
        return this.datasource.findOne({ where, attributes, include });
    }
}
