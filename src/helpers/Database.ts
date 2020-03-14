import { createConnection, EntitySchema, ConnectionOptions, EntitySchemaColumnOptions, ColumnType } from 'typeorm';
import { Model } from '../entities/Model';
import { FieldSummary } from './TypeDefinitionSummary';

export type DatabaseConfig = ConnectionOptions;
export class Database {
    constructor(protected config: DatabaseConfig) {}
    public async start(models: Model[]) {
        const entities = models.map((model) => model.toEntitySchema(this));
        const connection = await createConnection({
            ...this.config,
            synchronize: true,
            entities,
        });
        models.forEach((model) => model.setRepository(connection.getRepository(model.name)));
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
