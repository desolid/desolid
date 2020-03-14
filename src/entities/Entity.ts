import { NexusObjectTypeDef, enumType } from 'nexus/dist/core';
import { DefinitionNode } from 'graphql';
import { summarize } from '../helpers/TypeDefinitionSummary';
import { Model } from './Model';
import { Type } from './Type';

export class Entity extends NexusObjectTypeDef<string> {
    public static readonly dictionary = new Map<string, NexusObjectTypeDef<string>>();
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
                    const definitionSummary = summarize(definition);
                    if (Model.isModel(definitionSummary)) {
                        typeDef = new Model(definitionSummary);
                        models.push(typeDef);
                    } else {
                        typeDef = new Type(definitionSummary);
                    }
                default:
                    break;
            }
            this.dictionary.set(typeDef.name, typeDef);
        });
        return models;
    }
    public type = 'enum';
}
