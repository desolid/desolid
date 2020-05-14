import { Enum } from '.';
import { TypeDefinition } from '../../schema';
import { Order } from 'sequelize';

export class OrderBy extends Enum {
    constructor(protected readonly model: TypeDefinition) {
        super(`${model.name}OrderBy`, [
            ...model.fields.map((field) => `${field.name}_ASC`),
            ...model.fields.map((field) => `${field.name}_DESC`),
        ]);
    }
    public parse(value: string): Order {
        if (value) {
            const [field, sort] = value.split('_');
            return [field, sort as 'ASC' | 'DESC'];
        }
    }
}
