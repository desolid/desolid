import { NexusInputFieldConfig } from '@nexus/schema/dist/core';
import { Input, UpdateManyRelationsInput } from '.';
import { TypeDefinition, FieldDefinition } from '../../schema';
import { Model } from '../../database';

/**
 *
 * @todo handle update on relations: create,connect,delete
 */
export class UpdateInput extends Input {
    constructor(private readonly model: Model) {
        super(model.typeDefinition, `${model.name}UpdateInput`);
    }

    public get fields() {
        // remove forbidden fields
        return this.typeDfinition.fields.filter(
            (field) => field.type != 'ID' && !field.directives.createdAt && !field.directives.updatedAt,
        );
    }

    /**
     *
     * @todo handle file upload
     */
    protected getFieldConfig(field: FieldDefinition): NexusInputFieldConfig<string, string> {
        let type;
        if (field.relation) {
            if (field.config.list) {
                type = UpdateManyRelationsInput;
            } else {
                type = 'Int';
            }
        } else {
            type = field.type;
        }
        return {
            type,
            required: false,
        } as NexusInputFieldConfig<string, string>;
    }
}
