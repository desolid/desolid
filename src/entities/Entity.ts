import {
    NexusObjectTypeDef,
    enumType,
    NexusObjectTypeConfig,
    NexusScalarTypeDef,
    NexusEnumTypeDef,
    scalarType,
} from 'nexus/dist/core';
import { readFileSync } from 'fs-extra';
import gql from 'graphql-tag';
import * as path from 'path';
import { summarize } from '../helpers/definition-summary';
import scalars from '../helpers/scalars';
import Model from './Model';
import Type from './Type';
import { TypeDefinitionNode } from 'graphql';

type NexusTypeDef = Entity | NexusScalarTypeDef<string> | NexusEnumTypeDef<string>;

export default class Entity extends NexusObjectTypeDef<string> {
    public static readonly dictionary = new Map<string, NexusTypeDef>();
    private static getDefinitions(path: string) {
        const { definitions } = gql(readFileSync(path, { encoding: 'utf8' }));
        return definitions as TypeDefinitionNode[];
    }
    private static generateTypeDef(definition: TypeDefinitionNode) {
        if (this.dictionary.get(definition.name.value)) {
            throw new Error(`Conflict on "${definition.name.value}" !`);
        }
        let typeDef: NexusTypeDef;
        switch (definition.kind) {
            case 'ScalarTypeDefinition':
                typeDef = scalarType({
                    name: definition.name.value,
                    description: definition.description?.value,
                    serialize() {},
                });
                break;
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
                } else {
                    typeDef = new Type(summary);
                }
        }
        this.dictionary.set(typeDef.name, typeDef);
        return typeDef;
    }
    public static importPrimatives() {
        const models: Model[] = [];
        scalars.forEach((scalar) => {
            this.dictionary.set(scalar.name, scalar);
        });
        this.getDefinitions(path.join(__dirname, '../schema/primitives.graphql')).forEach((definition) => {
            const typeDef = this.generateTypeDef(definition) as Entity;
            if (typeDef.type == 'model') {
                models.push(typeDef as Model);
            }
        });
        return models;
    }
    public static import(path: string) {
        const models = this.importPrimatives();
        this.getDefinitions(`${path}/schema.graphql`).forEach((definition) => {
            const typeDef = this.generateTypeDef(definition) as Entity;
            if (typeDef.type == 'model') {
                models.push(typeDef as Model);
            }
        });
        return models;
    }
    constructor(name: string, config: NexusObjectTypeConfig<string>, public type: 'type' | 'model' | undefined) {
        super(name, config);
    }
}
