import { makeSchema, queryType } from 'nexus';
import { DefinitionNode } from 'graphql';
import { readFile } from 'fs-extra';
import gql from 'graphql-tag';
import { Enum, Model, TypeDef } from './generators';
import { Query } from './generators/Query';

export default class Desolid /** extends Singleton */ {
    public static dictionary = new Map<string, TypeDef>();
    constructor(private readonly path: string) {
        // erm?
    }
    private generateModels(definitions: readonly DefinitionNode[]) {
        const models: Model[] = [];
        definitions.forEach((definition) => {
            let typeDef: TypeDef;
            switch (definition.kind) {
                case 'EnumTypeDefinition':
                    typeDef = new Enum(definition);
                    break;
                case 'ObjectTypeDefinition':
                    typeDef = new Model(definition);
                    models.push(typeDef);
                default:
                    break;
            }
            Desolid.dictionary.set(typeDef.name, typeDef);
        });
        return models;
    }
    private generateQueries(models: Model[]) {
        return queryType({
            definition(t) {
                models.forEach((model) => model.createQuery(t));
            },
        });
    }
    public async generateSchema() {
        const schemaSource: string = await readFile(this.path, { encoding: 'utf8' });
        const { definitions } = gql(schemaSource);
        const models = this.generateModels(definitions);
        const Query = this.generateQueries(models);
        return makeSchema({
            types: [Query],
            outputs: {},
        });
    }
}
