import { NexusEnumTypeDef } from 'nexus/dist/core';
import { Model } from '.';

export class Enum extends NexusEnumTypeDef<string> {
    constructor(name: string, members: string[]) {
        super(name, { name, members });
    }
}
