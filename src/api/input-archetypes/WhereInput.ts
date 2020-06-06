import { Input } from '.';
import { NexusInputFieldConfig } from '@nexus/schema/dist/core';
import { WhereOptions, Op } from 'sequelize';
import { TypeDefinition, FieldDefinition } from '../../schema';
import { MapX } from '../../utils';

/**
 * @todo include all possibe where operators
 */
export class WhereInput extends Input {
    public static getObjectName(typeDefinition: TypeDefinition) {
        return `${typeDefinition.name}WhereInput`;
    }

    constructor(typeDefinition: TypeDefinition) {
        super(typeDefinition, WhereInput.getObjectName(typeDefinition));
    }

    public get fields() {
        return this.typeDfinition.fields.reduce((output, field) => {
            if (field.isScalar) {
                output.merge(this.genrateFieldOperators(field));
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

    protected getFieldConfig(field: FieldDefinition): NexusInputFieldConfig<string, string> {
        return {
            required: false,
        } as NexusInputFieldConfig<string, string>;
    }

    private get booleanOperatorFields() {
        const output = new MapX<string, FieldDefinition>();
        output.importArray(
            [
                {
                    name: 'OR',
                    type: this.name,
                    isScalar: false,
                    config: { nullable: true, list: [true] },
                } as any,
            ],
            'name',
        );
        return output;
    }

    private genrateFieldOperators(field: FieldDefinition) {
        const output = new MapX<string, FieldDefinition>();
        const fields = [field];
        ['in', 'notIn'].forEach((operator) => {
            fields.push({
                name: `${field.name}_${operator}`,
                type: field.type,
                isScalar: field.isScalar,
                config: { nullable: true, list: [true] },
            } as FieldDefinition);
        });
        const operators = ['eq', 'ne'];
        if (field.isString) {
            operators.push('startsWith', 'endsWith', 'substring');
        } else if (field.typeName != 'ID') {
            operators.push('lt', 'lte', 'gt', 'gte');
        }
        if (field.config.nullable) {
            operators.push('isNull');
        }
        operators.forEach((operator) => {
            fields.push({
                name: `${field.name}_${operator}`,
                type: operator != 'isNull' ? field.type : 'Boolean',
                isScalar: field.isScalar,
                config: { nullable: true },
            } as FieldDefinition);
        });
        output.importArray(fields, 'name');
        return output;
    }
}
