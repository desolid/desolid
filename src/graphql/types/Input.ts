import { NexusInputObjectTypeDef, InputDefinitionBlock, NexusInputFieldConfig, arg } from 'nexus/dist/core';
import { Model, Type } from '.';
import { Schema, FieldDefinition } from '..';

export abstract class Input extends NexusInputObjectTypeDef<string> {
    constructor(protected readonly model: Model, name: string) {
        super(name, {
            name,
            definition: (t) => this.definition(t),
        });
        this.model.schema.dictionary.set(name, this);
    }
    public toArg(required, list: boolean[] = undefined) {
        return arg({
            type: this,
            list,
            required,
        });
    }
    public get fields() {
        return this.model.definition.fields;
    }
    private definition(t: InputDefinitionBlock<string>) {
        this.fields.forEach((field) => {
            const type = this.model.schema.dictionary.get(field.type) as Type;
            t.field(field.name, {
                // TODO: create or connect on relations
                type: field.isScalar ? field.type : type && type.kind == 'model' ? 'ID' : type,
                required: !field.config.nullable,
                list: field.config.list,
                ...this.configField(field),
            });
        });
    }
    protected configField(field: FieldDefinition): NexusInputFieldConfig<string, string> {
        return {} as NexusInputFieldConfig<string, string>;
    }
}
