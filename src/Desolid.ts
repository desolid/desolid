import { makeSchema, queryType, mutationType } from 'nexus';
import { DefinitionNode } from 'graphql';
import { readFile } from 'fs-extra';
import gql from 'graphql-tag';
import { Enum, Model, TypeDef, Type } from './entities';
import { summary } from './helpers/ObjectTypeDefinitionSummary';

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
                    const definitionSummary = summary(definition);
                    if (Model.isModel(definitionSummary)) {
                        typeDef = new Model(definitionSummary);
                        models.push(typeDef as Model);
                    } else {
                        typeDef = new Type(definitionSummary);
                    }
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
                models.forEach((model) => model.generateQueries(t));
            },
        });
    }
    private generateMutations(models: Model[]) {
        return mutationType({
            definition(t) {
                models.forEach((model) => model.generateMutations(t));
            },
        });
    }
    public async generateSchema() {
        const schemaSource: string = await readFile(this.path, { encoding: 'utf8' });
        const { definitions } = gql(schemaSource);
        const models = this.generateModels(definitions);
        const Query = this.generateQueries(models);
        const Mutations = this.generateMutations(models);
        return makeSchema({
            types: [Query, Mutations],
            outputs: {},
        });
    }
}
