import { ModelMutationInput } from '.';
import { Model } from 'src/database';

export class CreateInput extends ModelMutationInput {
    public static getObjectName(model: Model) {
        return `${model.name}CreateInput`;
    }

    constructor(model: Model) {
        super(model, CreateInput.getObjectName(model));
    }

    private async validateAssosiations(input: any) {
        const assosiations = Object.values(this.model.datasource.associations);
        await Promise.all(
            assosiations.map(async (assosiation) => {
                const fieldName = this.getFieldNameFromAssosiation(assosiation);
                await this.model.assosiationSideExists(input[fieldName], assosiation);
            }),
        );
    }

    public async validate(input: any) {
        await this.validateAssosiations(input);
    }
}
