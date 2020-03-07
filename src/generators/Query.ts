import { NexusObjectTypeDef } from 'nexus/dist/core';
import { Model } from '.';

export class Query extends NexusObjectTypeDef<'Query'> {
    constructor(models: Model[]) {
        super('Query', {
            name: 'Query',
            definition(t) {
                models.forEach((model) => model.createQuery(t));
            },
        });
    }
}
