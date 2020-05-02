import {
    NexusScalarTypeDef,
    NexusEnumTypeDef,
    enumType,
    NexusInputObjectTypeDef,
    inputObjectType,
} from '@nexus/schema/dist/core';
import * as path from 'path';
import gql from 'graphql-tag';
import { readFileSync } from 'fs-extra';
import { TypeDefinitionNode, EnumTypeExtensionNode } from 'graphql';
import { TypeDefinition, scalars } from '.';

export type EntityDefinition =
    | TypeDefinition
    | NexusScalarTypeDef<string>
    | NexusEnumTypeDef<string>
    | NexusInputObjectTypeDef<string>;

export class Schema {
    public readonly dictionary = new Map<string, EntityDefinition>();
    /**
     * @param root root desolid directory
     */
    constructor(root: string) {
        scalars.forEach((scalar) => this.dictionary.set(scalar.name, scalar));
        this.import(path.join(__dirname, 'primitives.graphql'));
        this.import(`${root}/schema.graphql`);
    }

    public get models() {
        return [...this.dictionary.values()].filter((typeDef: TypeDefinition) => typeDef.isModel) as TypeDefinition[];
    }

    public get<T = TypeDefinition>(name: string) {
        return (this.dictionary.get(name) as any) as T;
    }

    private import(filePath: string) {
        const { definitions } = gql(readFileSync(filePath, { encoding: 'utf8' }));
        definitions.forEach((definition) => this.importTypeDef(definition as TypeDefinitionNode));
    }

    private importTypeDef(definition: TypeDefinitionNode | EnumTypeExtensionNode) {
        if (this.dictionary.get(definition.name.value) && definition.kind != 'EnumTypeExtension') {
            throw new Error(`Conflict on "${definition.name.value}" !`);
        }
        let entity: EntityDefinition;
        switch (definition.kind) {
            case 'EnumTypeDefinition':
                entity = enumType({
                    name: definition.name.value,
                    description: definition.description?.value,
                    members: definition.values.map((item) => item.name.value),
                });
                break;
            case 'EnumTypeExtension':
                const base = this.dictionary.get(definition.name.value) as NexusEnumTypeDef<string>;
                (base.value.members as string[]).push(...definition.values.map((item) => item.name.value));
                return;
            case 'ObjectTypeDefinition':
                entity = new TypeDefinition(this, definition);
                break;
            default:
                throw new Error(`Forbidden ${definition.kind}: "${definition.name.value}"`);
        }
        this.dictionary.set(entity.name, entity);
        return entity;
    }
}
