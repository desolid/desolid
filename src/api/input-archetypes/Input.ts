import { NexusInputObjectTypeDef, InputDefinitionBlock, NexusInputFieldConfig, arg } from '@nexus/schema/dist/core';
import { TypeDefinition, FieldDefinition, FieldType } from '../../schema';

export abstract class Input extends NexusInputObjectTypeDef<string> {
    constructor(protected readonly typeDfinition: TypeDefinition, name: string) {
        super(name, {
            name,
            definition: (t) => this.definition(t),
        });
        this.typeDfinition.schema.dictionary.set(name, this);
    }
    public toArg(required, list: boolean[] = undefined) {
        return arg({
            type: this,
            list,
            required,
        });
    }
    public get fields() {
        return this.typeDfinition.fields;
    }
    /**
     *
     * @param t
     * @todo handle files
     */
    private definition(t: InputDefinitionBlock<string>) {
        this.fields.forEach((field) => {
            let type = field.type;
            if (field.relation) {
                if (field.relation.typeDefinition.name == 'File') {
                    type = 'Upload';
                } else {
                    type = 'Int';
                }
            }
            t.field(this.getFieldName(field), {
                type,
                required: !field.config.nullable,
                list: field.config.list,
                ...this.getFieldConfig(field),
            });
        });
    }

    protected getFieldConfig(field: FieldDefinition): NexusInputFieldConfig<string, string> {
        return {} as NexusInputFieldConfig<string, string>;
    }

    protected getFieldName(field: FieldDefinition) {
        return field.name;
    }
}
