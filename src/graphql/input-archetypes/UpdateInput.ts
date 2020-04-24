import { NexusInputFieldConfig } from '@nexus/schema/dist/core';
import { Input } from '.';
import { TypeDefinition, FieldDefinition } from '../../schema';

/**
 * 
 * @todo handle update on relations: create,connect,delete
 */
export class UpdateInput extends Input {
    constructor(model: TypeDefinition) {
        super(model, `${model.name}UpdateInput`);
    }

    public get fields() {
        // remove forbidden fields
        return this.model.fields.filter(
            (field) =>
                field.type != 'ID' && !field.directives.createdAt && !field.directives.updatedAt && !field.relation,
        );
    }

    /**
     *
     * @todo handle file upload
     */
    protected configField(field: FieldDefinition): NexusInputFieldConfig<string, string> {
        return {
            required: false,
        } as NexusInputFieldConfig<string, string>;
    }
}
