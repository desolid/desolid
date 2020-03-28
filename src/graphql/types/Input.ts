import { NexusInputObjectTypeDef, InputDefinitionBlock, NexusInputFieldConfig } from 'nexus/dist/core';
import { Model } from '.';
import { Schema } from '..';

export abstract class Input extends NexusInputObjectTypeDef<string> {
    constructor(protected readonly model: Model, protected schema: Schema, name: string) {
        super(name, {
            name,
            definition: (t) => this.definition(t),
        });
    }
    public get fields() {
        return this.model.definition.fields;
    }
    private definition(t: InputDefinitionBlock<string>) {
        this.fields.forEach((field) => {
            const type = this.schema.dictionary.get(field.type);
            if (field.isScalar) {
                t.field(field.name, {
                    // TODO: create or connect on relations
                    type: field.isScalar ? 'ID' : field.type,
                    required: false,
                    list: field.config.list,
                } as NexusInputFieldConfig<string, string>);
            }
        });
    }
}
