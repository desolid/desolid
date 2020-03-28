import { Model, Input } from '.';
import { Schema } from '..';

export class WhereInput extends Input {
    constructor(model: Model, schema: Schema) {
        super(model, schema, `${model.name}WhereInput`);
    }
}
