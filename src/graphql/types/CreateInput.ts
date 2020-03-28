import { NexusInputFieldConfig } from 'nexus/dist/core';
import { Input, Model } from '.';
import { Schema, FieldDefinition } from '..';

export class CreateInput extends Input {
    constructor(protected readonly model: Model, protected schema: Schema) {
        super(model, schema, `${model.name}CreateInput`);
    }

    public get fields() {
        // remove auto fill fields
        return this.model.definition.fields.filter(
            (field) => !field.directives.createdAt && !field.directives.updatedAt,
        );
    }
    protected configField(field: FieldDefinition): NexusInputFieldConfig<string, string> {
        return {
            required: field.type == 'ID' ? false : !field.config.nullable,
        } as NexusInputFieldConfig<string, string>;
    }
}
