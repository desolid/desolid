import { NexusInputFieldConfig } from '@nexus/schema/dist/core';
import { TypeDefinition,FieldDefinition } from 'src/schema';
import { Input } from '.';

export class CreateInput extends Input {
    constructor(protected readonly model: TypeDefinition) {
        super(model, `${model.name}CreateInput`);
    }

    public get fields() {
        // remove auto fill fields
        return this.model.fields.filter(
            (field) => !field.directives.createdAt && !field.directives.updatedAt,
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
