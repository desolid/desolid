import { FieldOutConfig } from 'nexus/dist/core';
import { ObjectTypeDefinitionSummary } from '../helpers/TypeDefinitionSummary';
import Model from './Model';
import Entity from './Entity';

export default class extends Entity {
    public type = 'type';
    constructor(public readonly definition: ObjectTypeDefinitionSummary) {
        super(definition.name, {
            name: definition.name,
            description: definition.description,
            definition: (t) => this.fieldTypeDefs.forEach(({ name, config }) => t.field(name, config)),
        });
    }
    private get fieldTypeDefs() {
        return this.definition.fields.map((field) => {
            const type = Entity.dictionary.get(field.type) as Model;
            return {
                name: field.name,
                config: {
                    ...field.config,
                    type: type || field.type,
                } as FieldOutConfig<any, any>,
            };
        });
    }
}
