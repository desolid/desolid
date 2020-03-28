import { NexusEnumTypeDef } from 'nexus/dist/core';
import { Model } from '.';

export class OrderBy extends NexusEnumTypeDef<string> {
    constructor(protected readonly model: Model) {
        super(`${model.name}`, {
            name: `${model.name}`,
            members: [
                ...model.definition.fields.map((field) => `${field.name}_ASC`),
                ...model.definition.fields.map((field) => `${field.name}_DESC`),
            ],
        });
    }
}
