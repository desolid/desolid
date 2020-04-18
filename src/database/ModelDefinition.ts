import { DesolidObjectTypeDef, FieldDefinition } from '../schema';
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
    ModelCtor,
} from 'sequelize';

export type RelationType = 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';

export class ModelDefinition {
    private relations: { with: string; type: RelationType }[] = [];

    constructor(private typeDef: DesolidObjectTypeDef) {}

    public get name() {
        return this.typeDef.name;
    }

    public get options(): ModelOptions {
        return {
            comment: this.typeDef.description,
        };
    }

    public get attributes(): ModelAttributes {
        return this.typeDef.fields.reduce<{ [column: string]: ModelAttributeColumnOptions }>((columns, field) => {
            const column = this.fieldToColumn(field);
            if (column) {
                columns[field.name] = column;
            }
            return columns;
        }, {});
    }
    /**
     *
     * @param field
     * @todo handle custom `createdAt` & `updatedAt`
     */
    private fieldToColumn(field: FieldDefinition) {
        const column = {
            allowNull: field.config.nullable,
            unique: field.directives.unique ? true : false,
            defaultValue: field.directives.default?.value,
            comment: field.type,
        } as ModelAttributeColumnOptions;
        if (field.isScalar) {
            switch (field.type) {
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
            const ref = this.typeDef.schema.dictionary.get(field.type) as DesolidObjectTypeDef;
            switch (ref.constructor.name) {
                case 'DesolidObjectTypeDef':
                    if (ref.isModel) {
                        this.relations.push({
                            with: ref.name,
                            type: field.directives.relation?.type || field.config.list ? 'one-to-many' : 'one-to-one',
                        });
                        return undefined;
                    } else {
                        column.type = JSON;
                    }
                    break;
                default:
                    // so it's enum
                    column.type = STRING;
                    // column.type = this.mapColumnType('Enum');
                    // if (column.type == 'enum') {
                    //     column.enum = ((ref as any) as NexusEnumTypeDef<string>).value.members;
                    // }
                    // schema.columns[field.name] = column;
                    break;
            }
        }
        field.databaseType = column.type;
        return column;
    }

    public associate(models: { [key: string]: ModelCtor<any> }) {
        const left = models[this.name];
        this.relations.forEach((relation) => {
            const right = models[relation.with];
            switch (relation.type) {
                case 'one-to-one':
                    left.hasOne(right);
                    right.hasOne(left);
                    break;
                case 'one-to-many':
                    left.hasOne(right);
                    right.belongsTo(left);
                    break;
                case 'many-to-one':
                    left.belongsTo(right);
                    right.hasOne(left);
                    break;
                case 'many-to-many':
                    left.hasMany(right);
                    right.hasMany(left);
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
