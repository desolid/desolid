import {
    createConnection,
    EntitySchema,
    ConnectionOptions,
    EntitySchemaColumnOptions,
    ColumnType,
    EntitySchemaRelationOptions,
    DatabaseType,
} from 'typeorm';
import { EntitySchemaOptions } from 'typeorm/entity-schema/EntitySchemaOptions';
import { Model, Schema, Type, FieldDefinition, FieldType } from '../graphql';
import { NexusEnumTypeDef } from 'nexus/dist/core';
import { RelationType } from 'typeorm/metadata/types/RelationTypes';

export type DatabaseConfig = ConnectionOptions;
export class Database {
    private readonly entities: EntitySchema[] = [];
    constructor(protected config: DatabaseConfig, protected schema: Schema) {
        schema.models.forEach((model) => this.importModel(model));
    }
    public async start() {
        const connection = await createConnection({
            ...this.config,
            synchronize: true,
            entities: this.entities,
        });
        this.schema.models.forEach((model) => model.setRepository(connection.getRepository(model.name)));
    }
    importModel(model: Model) {
        const schema = new EntitySchemaOptions();
        schema.name = model.definition.name;
        schema.columns = {};
        schema.relations = {};
        model.definition.fields.forEach((field) => {
            const column = this.fieldToColumn(field);
            if (field.isScalar) {
                schema.columns[field.name] = column;
            } else {
                const ref = this.schema.dictionary.get(field.type) as Type;
                switch (ref.kind) {
                    case 'type':
                        column.type = this.mapColumnType('JSON');
                        schema.columns[field.name] = column;
                        break;
                    case 'model':
                        schema.relations[ref.name.toLowerCase()] = {
                            name: ref.name.toLowerCase(),
                            target: ref.name,
                            nullable: field.config.nullable,
                            type: this.getFieldRelationType(field),
                            cascade: true,
                        } as EntitySchemaRelationOptions;
                        break;
                    default:
                        // so it's enum
                        column.type = this.mapColumnType('Enum');
                        if (column.type == 'enum') {
                            column.enum = ((ref as any) as NexusEnumTypeDef<string>).value.members;
                        }
                        schema.columns[field.name] = column;
                        break;
                }
            }
        });
        this.entities.push(new EntitySchema(schema));
    }
    mapColumnType(fieldType: FieldType) {
        return fieldTypesMap[this.config.type][fieldType];
    }
    getFieldRelationType(field: FieldDefinition): RelationType {
        if (field.directives.relation) {
            return field.directives.relation.type;
        } else {
            return field.config.list ? 'one-to-many' : 'one-to-one';
        }
    }
    fieldToColumn(field: FieldDefinition) {
        const column = {
            nullable: field.config.nullable,
            unique: field.directives.unique ? true : false,
            default: field.directives.default?.value,
            comment: field.type,
        } as EntitySchemaColumnOptions;
        switch (field.type) {
            case 'ID':
                column.primary = true;
                column.generated = true;
                column.type = this.mapColumnType('ID');
                break;
            case 'Int':
                column.type = this.mapColumnType('Int');
                break;
            case 'Float':
                column.type = this.mapColumnType('Float');
                break;
            case 'Boolean':
                column.type = this.mapColumnType('Boolean');
                break;
            case 'DateTime':
                column.type = this.mapColumnType('DateTime');
                column.createDate = field.directives.createdAt ? true : false;
                column.updateDate = field.directives.updatedAt ? true : false;
                break;
            case 'JSON':
                column.type = this.mapColumnType('JSON');
            default:
                column.type = this.mapColumnType('String');
                break;
        }
        field.databaseType = column.type;
        return column;
    }
}

const fieldTypesMap: { [key in DatabaseType]?: { [key in FieldType]?: ColumnType } } = {
    sqlite: {
        ID: 'int',
        Int: 'int',
        Float: 'float',
        Boolean: 'boolean',
        DateTime: 'datetime',
        String: 'varchar',
        JSON: 'mediumtext',
        Enum: 'varchar',
    },
    mongodb: {
        ID: 'string',
        Int: 'int',
        Float: 'float',
        Boolean: 'boolean',
        DateTime: 'datetime',
        String: 'string',
        JSON: 'string',
        Enum: 'string',
    },
};
