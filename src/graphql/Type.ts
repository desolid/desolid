import { FieldOutConfig, NexusObjectTypeDef } from 'nexus/dist/core';
import { TypeDefinition } from './TypeDefinition';
import { Schema } from '.';

export class Type extends NexusObjectTypeDef<string> {
    constructor(
        public readonly definition: TypeDefinition,
        protected schema: Schema,
        public kind: 'type' | 'model' = 'type',
    ) {
        super(definition.name, {
            name: definition.name,
            description: definition.description,
            definition: (t) => this.fieldTypeDefs.forEach(({ name, config }) => t.field(name, config)),
        });
    }
    private get fieldTypeDefs() {
        return this.definition.fields.map((field) => {
            const type = this.schema.dictionary.get(field.type);
            return {
                name: field.name,
                config: {
                    ...field.config,
                    type: type || field.type,
                } as FieldOutConfig<any, any>,
            };
        });
    }
}
