import { NexusInputFieldConfig } from '@nexus/schema/dist/core';
import { Input } from '.';
import { TypeDefinition, FieldDefinition } from '../../schema';

export class UpdateInput extends Input {
    constructor(model: TypeDefinition) {
        super(model, `${model.name}UpdateInput`);
    }

    public get fields() {
        // remove forbidden fields
        return this.model.fields.filter(
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
