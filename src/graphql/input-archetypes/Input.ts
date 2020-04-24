import { NexusInputObjectTypeDef, InputDefinitionBlock, NexusInputFieldConfig, arg } from '@nexus/schema/dist/core';
import { TypeDefinition, FieldDefinition } from '../../schema';

export abstract class Input extends NexusInputObjectTypeDef<string> {
    constructor(protected readonly model: TypeDefinition, name: string) {
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
    /**
     *
     * @param t
     * @todo `create` or `connect` on relations
     */
    private definition(t: InputDefinitionBlock<string>) {
        this.fields.forEach((field) => {
            t.field(field.name, {
                type: field.relation ? 'Int' : field.type,
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
