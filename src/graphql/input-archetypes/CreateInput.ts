import { ModelMutationInput } from '.';
import { Model } from 'src/database';

export class CreateOneInput extends ModelMutationInput {
    public static getObjectName(model: Model) {
        return `${model.name}CreateOneInput`;
    }

    constructor(model: Model) {
        super(model, CreateOneInput.getObjectName(model));
    }

    public async validate(input: any) {
        await this.validateAsosations(input);
    }
}
