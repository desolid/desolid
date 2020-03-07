import { EnumTypeDefinitionNode } from 'graphql';
import { NexusEnumTypeDef, NexusArgDef } from 'nexus/dist/core';

export class Enum extends NexusEnumTypeDef<string> {
    constructor(protected readonly definition: EnumTypeDefinitionNode) {
        super(definition.name.value, {
            name: definition.name.value,
            description: definition.description?.value,
            members: definition.values.map((item) => item.name.value),
        });
    }
}
