import { TypeDefinition } from '../../schema';
import { NexusObjectTypeDef, ObjectDefinitionBlock } from '@nexus/schema/dist/core';
import { Aggregate } from './Aggregate';

export class Connection extends NexusObjectTypeDef<string> {
    public static getObjectName(typeDefinition: TypeDefinition) {
        return `${typeDefinition.name}Connection`;
    }

    constructor(typeDefinition: TypeDefinition) {
        super(Connection.getObjectName(typeDefinition), {
            name: Connection.getObjectName(typeDefinition),
            definition(t: ObjectDefinitionBlock<string>) {
                t.field('aggregate', { type: new Aggregate(typeDefinition), nullable: false });
            },
        });
        typeDefinition.schema.dictionary.set(this.name, this);
    }
}
