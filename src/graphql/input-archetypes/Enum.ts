import { NexusEnumTypeDef } from '@nexus/schema/dist/core';

export class Enum extends NexusEnumTypeDef<string> {
    constructor(name: string, members: string[]) {
        super(name, { name, members });
    }
}
