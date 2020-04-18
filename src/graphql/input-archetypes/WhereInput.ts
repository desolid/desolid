import { Input } from '.';
import { FieldDefinition } from '..';
import { NexusInputFieldConfig } from 'nexus/dist/core';
import { searchableScalars, DesolidObjectTypeDef } from '../../schema';

/**
 * @todo include all possibe where operators
 */
export class WhereInput extends Input {
    constructor(model: DesolidObjectTypeDef) {
        super(model, `${model.name}WhereInput`);
    }

    public get fields() {
        return this.model.fields.reduce((output, field) => {
            if (field.isScalar) {
                output.push(...this.genrateFieldOperators(field));
            }
            return output;
        }, this.booleanOperatorFields);
    }

    public parse(value: any): Object {
        if (!value) return;
        return new Object((qb) => {
            for (let [fieldOperator, operand] of Object.entries<any>(value)) {
                switch (fieldOperator) {
                    case 'OR':
                        (operand as any[]).forEach((item) => qb.orWhere(this.parse(item)));
                        break;
                    default:
                        const [field, operator] = fieldOperator.split('_');
                        switch (operator) {
                            case 'in':
                                qb.andWhere(`${field} IN (:...operand)`, { operand });
                                break;
                            case 'not_in':
                                qb.andWhere(`${field} NOT IN (:...operand)`, { operand });
                                break;
                            case 'not':
                                qb.andWhere(`${field} != :operand`, { operand });
                                break;
                            case 'lt':
                                qb.andWhere(`${field} < :operand`, { operand });
                                break;
                            case 'lte':
                                qb.andWhere(`${field} <= :operand`, { operand });
                                break;
                            case 'gt':
                                qb.andWhere(`${field} > :operand`, { operand });
                                break;
                            case 'gte':
                                qb.andWhere(`${field} >= :operand`, { operand });
                                break;
                            case 'like':
                                qb.andWhere(`${field} LIKE :operand`, { operand });
                                break;
                            case 'not_like':
                                qb.andWhere(`${field} NOT LIKE :operand`, { operand });
                                break;
                            case 'is_null':
                                if (operand) {
                                    qb.andWhere(`${field} IS NULL`);
                                } else {
                                    qb.andWhere(`${field} IS NOT NULL`);
                                }
                                break;
                            default:
                                qb.andWhere(`${field} = :operand`, { operand });
                                break;
                        }
                }
            }
        });
    }

    protected configField(field: FieldDefinition): NexusInputFieldConfig<string, string> {
        return {
            required: false,
        } as NexusInputFieldConfig<string, string>;
    }

    private get booleanOperatorFields() {
        return [
            {
                name: 'OR',
                type: this.name,
                isScalar: false,
                config: { nullable: true, list: [true] },
            },
        ] as FieldDefinition[];
    }

    private genrateFieldOperators(field: FieldDefinition) {
        const fields = [field];
        ['in', 'not_in'].forEach((operator) => {
            fields.push({
                name: `${field.name}_${operator}`,
                type: field.type,
                isScalar: field.isScalar,
                config: { nullable: true, list: [true] },
            } as FieldDefinition);
        });
        const scalarOperators = ['not'];
        if (searchableScalars.indexOf(field.type) >= 0) {
            scalarOperators.push('like', 'not_like');
        } else if (field.type != 'ID') {
            scalarOperators.push('lt', 'lte', 'gt', 'gte');
        }
        if (field.config.nullable) {
            scalarOperators.push('is_null');
        }
        scalarOperators.forEach((operator) => {
            fields.push({
                name: `${field.name}_${operator}`,
                type: operator != 'is_null' ? field.type : 'Boolean',
                isScalar: field.isScalar,
                config: { nullable: true },
            } as FieldDefinition);
        });
        return fields;
    }
}
