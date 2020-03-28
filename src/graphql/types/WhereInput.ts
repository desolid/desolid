import { Model, Input } from '.';
import { Schema } from '..';
import { FieldDefinition } from '../TypeDefinition';
import { NexusInputFieldConfig } from 'nexus/dist/core';

export class WhereInput extends Input {
    constructor(model: Model, schema: Schema) {
        super(model, schema, `${model.name}WhereInput`);
    }
    protected configField(field: FieldDefinition): NexusInputFieldConfig<string, string> {
        return {
            required: false,
        } as NexusInputFieldConfig<string, string>;
    }
}
