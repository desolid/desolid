import { TypeDefinition } from '../../schema';
import { NexusObjectTypeDef, ObjectDefinitionBlock } from '@nexus/schema/dist/core';

export class Aggregate extends NexusObjectTypeDef<string> {
    public static getObjectName(typeDefinition: TypeDefinition) {
        return `Aggregate${typeDefinition.name}`;
    }

    constructor(typeDefinition: TypeDefinition) {
        super(Aggregate.getObjectName(typeDefinition), {
            name: Aggregate.getObjectName(typeDefinition),
            definition(t: ObjectDefinitionBlock<string>) {
                t.field('count', { type: 'Int', nullable: true });
            },
        });
        typeDefinition.schema.dictionary.set(this.name, this);
    }
}
