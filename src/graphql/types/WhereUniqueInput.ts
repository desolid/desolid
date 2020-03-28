import { Input, Model } from '.';
import { Schema } from '..';
import { FieldDefinition } from '../TypeDefinition';
import { NexusInputFieldConfig } from 'nexus/dist/core';

export class WhereUniqueInput extends Input {
    constructor(model: Model, schema: Schema) {
        super(model, schema, `${model.name}WhereUniqueInput`);
    }
    public get fields() {
        // only ID & unique fields
        return this.model.definition.fields.filter((field) => field.type == 'ID' || field.directives.unique);
    }
    protected configField(field: FieldDefinition): NexusInputFieldConfig<string, string> {
        return {
            required: false,
        } as NexusInputFieldConfig<string, string>;
    }
}