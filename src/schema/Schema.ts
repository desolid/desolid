import { NexusScalarTypeDef, NexusEnumTypeDef, enumType, NexusInputObjectTypeDef } from 'nexus/dist/core';
import * as path from 'path';
import gql from 'graphql-tag';
import { readFileSync } from 'fs-extra';
import { TypeDefinitionNode, EnumTypeExtensionNode } from 'graphql';
import { TypeDefinition, scalars } from '.';

type TypeDef =
    | TypeDefinition
    | NexusScalarTypeDef<string>
    | NexusEnumTypeDef<string>
    | NexusInputObjectTypeDef<string>;

export class Schema {
    public readonly dictionary = new Map<string, TypeDef>();
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

    private import(filePath: string) {
        const { definitions } = gql(readFileSync(filePath, { encoding: 'utf8' }));
        definitions.forEach((definition) => this.importTypeDef(definition as TypeDefinitionNode));
    }

    private importTypeDef(definition: TypeDefinitionNode | EnumTypeExtensionNode) {
        if (this.dictionary.get(definition.name.value) && definition.kind != 'EnumTypeExtension') {
            throw new Error(`Conflict on "${definition.name.value}" !`);
        }
        let entity: TypeDef;
        switch (definition.kind) {
            case 'ScalarTypeDefinition':
                throw new Error(`Scalar Difinition ("${definition.name.value}") Forbidden !`);
                break;
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
        }
        this.dictionary.set(entity.name, entity);
        return entity;
    }
}
