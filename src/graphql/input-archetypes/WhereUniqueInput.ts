import { Input } from '.';
import { FieldDefinition, DesolidObjectTypeDef } from '../../schema';
import { NexusInputFieldConfig } from 'nexus/dist/core';

export class WhereUniqueInput extends Input {
    constructor(model: DesolidObjectTypeDef) {
        super(model, `${model.name}WhereUniqueInput`);
    }
    public get fields() {
        // only ID & unique fields
        return this.model.fields.filter((field) => field.type == 'ID' || field.directives.unique);
    }
    protected configField(field: FieldDefinition): NexusInputFieldConfig<string, string> {
        return {
            required: false,
        } as NexusInputFieldConfig<string, string>;
    }
}
