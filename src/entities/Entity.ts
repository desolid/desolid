import { NexusObjectTypeDef, enumType, NexusObjectTypeConfig } from 'nexus/dist/core';
import { DefinitionNode } from 'graphql';
import { summarize } from '../helpers/TypeDefinitionSummary';
import Model from './Model';
import Type from './Type';

export default class Entity extends NexusObjectTypeDef<string> {
    public static readonly dictionary = new Map<string, Entity>();
    public static import(definitions: readonly DefinitionNode[]) {
        const models: Model[] = [];
        definitions.forEach((definition) => {
            let typeDef: any;
            switch (definition.kind) {
                case 'EnumTypeDefinition':
                    typeDef = enumType({
                        name: definition.name.value,
                        description: definition.description?.value,
                        members: definition.values.map((item) => item.name.value),
                    });
                    break;
                case 'ObjectTypeDefinition':
                    const summary = summarize(definition);
                    if (summary.directives.model) {
                        typeDef = new Model(summary);
                        models.push(typeDef);
                    } else {
                        typeDef = new Type(summary);
                    }
                default:
                    break;
            }
            this.dictionary.set(typeDef.name, typeDef);
        });
        return models;
    }
    constructor(name: string, config: NexusObjectTypeConfig<string>, public type: 'type' | 'model' | undefined) {
        super(name, config);
    }
}
