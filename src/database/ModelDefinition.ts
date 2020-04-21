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
import { TypeDefinition, FieldDefinition } from '../schema';

export class ModelDefinition {
    constructor(private typeDef: TypeDefinition) {}

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
            const ref = field.type as TypeDefinition;
            switch (field.type.constructor.name) {
                case 'DesolidObjectTypeDef':
                    if (ref.isModel) {
                        return;
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
        this.typeDef.relations.forEach(({ relation, name }) => {
            const right = models[relation.model.name];
            switch (relation.type) {
                case 'one-to-one':
                    left.hasOne(right, { as: name, constraints: false });
                    break;
                case 'one-to-many':
                    left.hasOne(right, { as: name, constraints: false });
                    break;
                case 'many-to-one':
                    left.belongsTo(right, { as: name, constraints: false });
                    break;
                case 'many-to-many':
                    left.hasMany(right, { as: name, constraints: false });
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
