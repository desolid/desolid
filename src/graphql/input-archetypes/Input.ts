import { NexusInputObjectTypeDef, InputDefinitionBlock, NexusInputFieldConfig, arg } from 'nexus/dist/core';
import { DesolidObjectTypeDef, FieldDefinition } from '../../schema';

export abstract class Input extends NexusInputObjectTypeDef<string> {
    constructor(protected readonly model: DesolidObjectTypeDef, name: string) {
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
        return this.model.fields;
    }
    private definition(t: InputDefinitionBlock<string>) {
        this.fields.forEach((field) => {
            const ref = this.model.schema.dictionary.get(field.type) as DesolidObjectTypeDef;
            t.field(field.name, {
                // TODO: create or connect on relations
                type: field.isScalar ? field.type : ref && ref.isModel ? 'ID' : ref,
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
