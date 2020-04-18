import { Input } from '.';
import { FieldDefinition } from '..';
import { NexusInputFieldConfig } from 'nexus/dist/core';
import { searchableScalars as stringScalars, DesolidObjectTypeDef } from '../../schema';
import { WhereOptions, Op } from 'sequelize';

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

    public parse(value: any) {
        if (!value) return;
        const expressions: WhereOptions[] = [];
        for (let [fieldOperator, operand] of Object.entries<any>(value)) {
            switch (fieldOperator) {
                case 'OR':
                    (operand as any[]).forEach((item) => expressions.push(this.parse(item)));
                    break;
                default:
                    const [field, operator] = fieldOperator.split('_');
                    let expression;
                    switch (operator) {
                        case 'isNull':
                            if (operand) {
                                expression = { [field]: { [Op.is]: null } };
                            } else {
                                expression = { [field]: { [Op.not]: null } };
                            }
                            break;
                        default:
                            expression = { [field]: { [Op[operator]]: operand } };
                            break;
                    }
                    expressions.push(expression);
            }
        }
        return { [Op.and]: expressions } as WhereOptions;
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
        ['in', 'notIn'].forEach((operator) => {
            fields.push({
                name: `${field.name}_${operator}`,
                type: field.type,
                isScalar: field.isScalar,
                config: { nullable: true, list: [true] },
            } as FieldDefinition);
        });
        const scalarOperators = ['eq', 'ne'];
        if (stringScalars.indexOf(field.type) >= 0) {
            scalarOperators.push('startsWith', 'endsWith', 'substring');
        } else if (field.type != 'ID') {
            scalarOperators.push('lt', 'lte', 'gt', 'gte');
        }
        if (field.config.nullable) {
            scalarOperators.push('isNull');
        }
        scalarOperators.forEach((operator) => {
            fields.push({
                name: `${field.name}_${operator}`,
                type: operator != 'isNull' ? field.type : 'Boolean',
                isScalar: field.isScalar,
                config: { nullable: true },
            } as FieldDefinition);
        });
        return fields;
    }
}
