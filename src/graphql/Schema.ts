import { NexusScalarTypeDef, NexusEnumTypeDef, scalarType, enumType } from 'nexus/dist/core';
import * as path from 'path';
import gql from 'graphql-tag';
import { readFileSync } from 'fs-extra';
import { TypeDefinitionNode, EnumTypeExtensionNode } from 'graphql';
import { Model, Type, TypeDefinition, scalars } from '.';

type NexusTypeDef = Type | NexusScalarTypeDef<string> | NexusEnumTypeDef<string>;

export class Schema {
    public readonly dictionary = new Map<string, NexusTypeDef>();
    public readonly models: Model[] = [];
    /**
     * @param root root desolid directory
     */
    constructor(root: string) {
        scalars.forEach((scalar) => this.dictionary.set(scalar.name, scalar));
        this.import(path.join(__dirname, 'primitives.graphql'));
        this.import(`${root}/schema.graphql`);
    }
    private import(filePath: string) {
        const { definitions } = gql(readFileSync(filePath, { encoding: 'utf8' }));
        definitions.forEach((definition) => this.importTypeDef(definition as TypeDefinitionNode));
    }
    private importTypeDef(definition: TypeDefinitionNode | EnumTypeExtensionNode) {
        if (this.dictionary.get(definition.name.value) && definition.kind != 'EnumTypeExtension') {
            throw new Error(`Conflict on "${definition.name.value}" !`);
        }
        let entity: NexusTypeDef;
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
                const typeDef = new TypeDefinition(definition);
                if (typeDef.directives.model) {
                    entity = new Model(typeDef, this);
                    this.models.push(entity as Model);
                } else {
                    entity = new Type(typeDef, this);
                }
        }
        this.dictionary.set(entity.name, entity);
        return entity;
    }
}
