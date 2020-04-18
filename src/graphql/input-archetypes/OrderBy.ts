import { Enum } from '.';
import { DesolidObjectTypeDef } from 'src/schema';

export class OrderBy extends Enum {
    constructor(protected readonly model: DesolidObjectTypeDef) {
        super(`${model.name}OrderBy`, [
            ...model.fields.map((field) => `${field.name}_ASC`),
            ...model.fields.map((field) => `${field.name}_DESC`),
        ]);
    }
    public parse(value: string) {
        if (value) {
            const [field, sort] = value.split('_');
            return { [field]: sort as 'ASC' | 'DESC' };
        }
    }
}
