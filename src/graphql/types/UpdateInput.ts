import { NexusInputFieldConfig } from 'nexus/dist/core';
import { Input, Model } from '.';
import { Schema, FieldDefinition } from '..';

export class UpdateInput extends Input {
    constructor(model: Model) {
        super(model, `${model.name}UpdateInput`);
    }

    public get fields() {
        // remove forbidden fields
        return this.model.definition.fields.filter(
            (field) => field.type != 'ID' && !field.directives.createdAt && !field.directives.updatedAt,
        );
    }

    /**
     *
     * @todo handle file upload
     */
    protected configField(field: FieldDefinition): NexusInputFieldConfig<string, string> {
        return {
            required: field.type == 'ID' ? false : !field.config.nullable,
        } as NexusInputFieldConfig<string, string>;
    }
}
