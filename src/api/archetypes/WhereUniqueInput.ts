import { Input } from '.';
import { FieldDefinition, TypeDefinition } from '../../schema';
import { NexusInputFieldConfig } from '@nexus/schema/dist/core';

export class WhereUniqueInput extends Input {
    public static getObjectName(model: TypeDefinition) {
        return `${model.name}WhereUniqueInput`;
    }

    constructor(model: TypeDefinition) {
        super(model, WhereUniqueInput.getObjectName(model));
    }
    public get fields() {
        // only ID & unique fields
        return this.typeDfinition.fields.filter((field) => field.typeName == 'ID' || field.directives.get('unique'));
    }

    protected getFieldConfig(field: FieldDefinition): NexusInputFieldConfig<string, string> {
        return {
            required: false,
        } as NexusInputFieldConfig<string, string>;
    }
}
