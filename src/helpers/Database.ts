import {
    createConnection,
    EntitySchema,
    ConnectionOptions,
    EntitySchemaColumnOptions,
    ColumnType,
    EntitySchemaRelationOptions,
} from 'typeorm';
import { EntitySchemaOptions } from 'typeorm/entity-schema/EntitySchemaOptions';
import Model from '../entities/Model';
import { FieldSummary } from './TypeDefinitionSummary';

export type DatabaseConfig = ConnectionOptions;
export class Database {
    constructor(protected config: DatabaseConfig) {}
    public async start(models: Model[]) {
        const entities = models.map((model) => this.modelToEntitySchema(model));
        const connection = await createConnection({
            ...this.config,
            synchronize: true,
            entities,
        });
        models.forEach((model) => model.setRepository(connection.getRepository(model.name)));
    }
    modelToEntitySchema(model: Model) {
        const schema = new EntitySchemaOptions();
        schema.name = model.definition.name;
        schema.columns = {};
        schema.relations = {};
        model.definition.fields.forEach((field) => {
            const column = this.fieldToColumnDefinition(field);
            if (column.type) {
                schema.columns[field.name] = column;
            } else {
                const ref = Model.dictionary.get(field.type);
                switch (ref.type) {
                    case 'type':
                        column.type = this.getLocalColumnType('Text');
                        schema.columns[field.name] = column;
                        break;
                    case 'model':
                        // TODO
                        schema.relations[ref.name.toLowerCase()] = {
                            name: ref.name.toLowerCase(),
                            target: ref.name,
                            nullable: field.config.nullable,
                            type: field.config.list ? 'one-to-many' : 'one-to-one',
                            cascade: true,
                        } as EntitySchemaRelationOptions;
                        break;
                    default:
                        // enum
                        column.type = this.getLocalColumnType('String');
                        schema.columns[field.name] = column;
                        break;
                }
            }
        });
        return new EntitySchema(schema);
    }
    getLocalColumnType(fieldType: FieldTypes) {
        return localColumnsTypesMap[this.config.type][fieldType];
    }
    fieldToColumnDefinition(field: FieldSummary) {
        const column = {
            nullable: field.config.nullable,
        } as EntitySchemaColumnOptions;
        switch (field.type) {
            case 'ID':
                column.primary = true;
                column.generated = true;
                column.type = this.getLocalColumnType('ID');
                break;
            case 'Int':
                column.type = this.getLocalColumnType('Int');
                break;
            case 'Float':
                column.type = this.getLocalColumnType('Float');
                break;
            case 'Boolean':
                column.type = this.getLocalColumnType('Boolean');
                break;
            case 'DateTime':
                column.type = this.getLocalColumnType('DateTime');
                break;
            case 'String':
            case 'Email':
            case 'Password':
            case 'PhoneNumber':
                column.type = this.getLocalColumnType('String');
                break;
            case 'Text':
                column.type = this.getLocalColumnType('Text');
                break;
        }
        return column;
    }
}

type FieldTypes = 'ID' | 'Int' | 'Float' | 'Boolean' | 'DateTime' | 'String' | 'Text';
const localColumnsTypesMap: { [key: string]: { [key in FieldTypes]: ColumnType } } = {
    sqlite: {
        ID: 'int',
        Int: 'int',
        Float: 'float',
        Boolean: 'boolean',
        DateTime: 'datetime',
        String: 'varchar',
        Text: 'text',
    },
};
