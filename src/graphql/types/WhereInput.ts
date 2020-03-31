import { Model, Input } from '.';
import { FieldDefinition } from '../TypeDefinition';
import { NexusInputFieldConfig } from 'nexus/dist/core';

export class WhereInput extends Input {
    constructor(model: Model) {
        super(model, `${model.name}WhereInput`);
    }
    protected configField(field: FieldDefinition): NexusInputFieldConfig<string, string> {
        return {
            required: false,
        } as NexusInputFieldConfig<string, string>;
    }
}
