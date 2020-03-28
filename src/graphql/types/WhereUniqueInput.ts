import { Input, Model } from '.';
import { Schema } from '..';

export class WhereUniqueInput extends Input {
    constructor(model: Model, schema: Schema) {
        super(model, schema, `${model.name}WhereUniqueInput`);
    }
    public get fields() {
        // only ID & unique fields
        return this.model.definition.fields.filter((field) => field.type == 'ID' || field.directives.unique);
    }
}
