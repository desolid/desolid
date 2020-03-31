import { NexusEnumTypeDef } from 'nexus/dist/core';
import { Model, Enum } from '.';

export class OrderBy extends Enum {
    constructor(protected readonly model: Model) {
        super(`${model.name}OrderBy`, [
            ...model.definition.fields.map((field) => `${field.name}_ASC`),
            ...model.definition.fields.map((field) => `${field.name}_DESC`),
        ]);
    }
    public parse(value: string) {
        return { [value.split('_')[0]]: value.split('_')[1] as 'ASC' | 'DESC' };
    }
}
