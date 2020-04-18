import { NexusEnumTypeDef } from 'nexus/dist/core';

export class Enum extends NexusEnumTypeDef<string> {
    constructor(name: string, members: string[]) {
        super(name, { name, members });
    }
}
