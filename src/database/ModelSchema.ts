import {
    ModelAttributes,
    ModelAttributeColumnOptions,
    STRING,
    ModelOptions,
    JSON,
    INTEGER,
    BIGINT,
    FLOAT,
    BOOLEAN,
    DATE,
} from 'sequelize';
import { TypeDefinition, FieldDefinition } from '../schema';
import { MapX } from '../utils';
import { Model } from '.';

export class ModelSchema {
    constructor(public readonly typeDefinition: TypeDefinition) {}

    public get name() {
        return this.typeDefinition.name;
    }

    public get options(): ModelOptions {
        return {
            comment: this.typeDefinition.description,
        };
    }

    public get attributes(): ModelAttributes {
        return this.typeDefinition.fields.reduce<{ [column: string]: ModelAttributeColumnOptions }>(
            (columns, field) => {
                const column = this.fieldToColumn(field);
                if (column) {
                    columns[field.name] = column;
                }
                return columns;
            },
            {},
        );
    }

    /**
     *
     * @param field
     * @todo handle custom `createdAt` & `updatedAt`
     */
    private fieldToColumn(field: FieldDefinition) {
        const column = {
            allowNull: field.config.nullable,
            unique: field.directives.get('unique') ? true : false,
            // defaultValue: field.directives.default?.value,
            comment: field.typeName,
        } as ModelAttributeColumnOptions;
        if (field.isScalar) {
            switch (field.typeName) {
                case 'ID':
                    column.primaryKey = true;
                    column.autoIncrement = true;
                    column.type = INTEGER;
                    break;
                case 'Int':
                    column.type = INTEGER;
                    break;
                case 'Long':
                case 'BigInt':
                    column.type = BIGINT;
                    break;
                case 'Float':
                    column.type = FLOAT;
                    break;
                case 'Boolean':
                    column.type = BOOLEAN;
                    break;
                case 'DateTime':
                    column.type = DATE;
                    // if(field.directives.createdAt || field.directives.createdAt) {
                    //     column.field = field.name;
                    // }
                    break;
                case 'JSON':
                    column.type = JSON;
                default:
                    column.type = STRING;
                    break;
            }
        } else {
            const right = field.type as TypeDefinition;
            if (right instanceof TypeDefinition) {
                if (right.isModel) {
                    if (field.config.list) {
                        // A `one to many` or `many to many` relation
                    } else {
                        // The FOREIGN_KEY
                        // A `one to one` or `many to one` relation
                        column.type = INTEGER;
                    }
                    return;
                } else {
                    column.type = JSON;
                }
            } else {
                // so it's enum
                column.type = STRING;
                // column.type = this.mapColumnType('Enum');
                // if (column.type == 'enum') {
                //     column.enum = ((ref as any) as NexusEnumTypeDef<string>).value.members;
                // }
                // schema.columns[field.name] = column;
            }
        }
        return column;
    }

    private joinTableNameStrategy(right: string, left: string) {
        return [right, left].sort().join('_');
    }

    public associate(models: MapX<string, Model>) {
        const left = models.get(this.name);
        left.relations.forEach((field) => {
            const right = models.get(field.typeName);
            switch (field.relationType) {
                case 'one-to-one':
                    left.datasource.belongsTo(right.datasource, { foreignKey: field.name });
                    break;
                case 'one-to-many':
                    left.datasource.hasMany(right.datasource);
                    break;
                case 'many-to-one':
                    left.datasource.belongsTo(right.datasource, { as: field.name });
                    break;
                case 'many-to-many':
                    const relationTableName = this.joinTableNameStrategy(right.name, left.name);
                    left.datasource.belongsToMany(right.datasource, { through: relationTableName, as: field.name });
                    break;
            }
        });
    }
}

// const fieldTypesMap: { [key in DatabaseType]?: { [key in FieldType]?: ColumnType } } = {
//     sqlite: {
//         ID: 'int',
//         Int: 'int',
//         Float: 'float',
//         Boolean: 'boolean',
//         DateTime: 'datetime',
//         String: 'varchar',
//         JSON: 'mediumtext',
//         Enum: 'varchar',
//     },
//     mongodb: {
//         ID: 'string',
//         Int: 'int',
//         Float: 'float',
//         Boolean: 'boolean',
//         DateTime: 'datetime',
//         String: 'string',
//         JSON: 'string',
//         Enum: 'string',
//     },
// };
