import { Model, Input } from '.';
import { FieldDefinition } from '..';
import { NexusInputFieldConfig } from 'nexus/dist/core';
import { searchableScalars } from '../scalars';

/**
 * @todo include all possibe where operators
 */
export class WhereInput extends Input {
    constructor(model: Model) {
        super(model, `${model.name}WhereInput`);
    }

    public get fields() {
        return this.model.definition.fields.reduce((output, field) => {
            if (field.isScalar) {
                output.push(...this.genrateFieldOperators(field));
            }
            return output;
        }, this.booleanOperatorFields);
    }

    protected configField(field: FieldDefinition): NexusInputFieldConfig<string, string> {
        return {
            required: false,
        } as NexusInputFieldConfig<string, string>;
    }

    private get booleanOperatorFields() {
        return [
            {
                name: 'AND',
                type: this.name,
                isScalar: false,
                config: { nullable: true, list: [true] },
            },
            {
                name: 'OR',
                type: this.name,
                isScalar: false,
                config: { nullable: true, list: [true] },
            },
            {
                name: 'NOT',
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
        const singleOperandOperators = ['not'];
        if (searchableScalars.indexOf(field.type) >= 0) {
            singleOperandOperators.push('like');
        } else if (field.type != 'ID') {
            singleOperandOperators.push('lt', 'lte', 'gt', 'gte');
        }
        singleOperandOperators.forEach((operator) => {
            fields.push({
                name: `${field.name}_${operator}`,
                type: field.type,
                isScalar: field.isScalar,
                config: { nullable: true },
            } as FieldDefinition);
        });
        return fields;
    }
}
