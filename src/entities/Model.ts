import { EntitySchemaOptions } from 'typeorm/entity-schema/EntitySchemaOptions';
import { Repository, EntitySchemaRelationOptions, EntitySchema } from 'typeorm';
import { ObjectTypeDefinitionSummary } from '../helpers/TypeDefinitionSummary';
import { Type } from './Type';
import { Database } from '../helpers/Database';
import { Entity } from './Entity';

export class Model extends Type {
    public static isModel(summary: ObjectTypeDefinitionSummary) {
        return summary.directives.filter((directive) => directive.name == 'model').length > 0;
    }
    public type = 'model';
    public repository: Repository<any>;
    constructor(protected readonly definition: ObjectTypeDefinitionSummary) {
        super(definition);
    }
    public setRepository(repository: Repository<any>) {
        this.repository = repository;
    }
    public toEntitySchema(database: Database) {
        const schema = new EntitySchemaOptions();
        schema.name = this.definition.name;
        schema.columns = {};
        schema.relations = {};
        this.definition.fields.forEach((field) => {
            const column = database.fieldToColumnDefinition(field);
            if (column.type) {
                schema.columns[field.name] = column;
            } else {
                const ref = Type.dictionary.get(field.type) as Entity;
                switch (ref.type) {
                    case 'enum':
                        column.type = database.getLocalColumnType('String');
                        schema.columns[field.name] = column;
                        break;
                    case 'type':
                        column.type = database.getLocalColumnType('Text');
                        schema.columns[field.name] = column;
                        break;
                    case 'model':
                        // TODO
                        schema.relations[ref.name.toLowerCase()] = {
                            name: ref.name.toLowerCase(),
                            target: ref.name,
                            nullable: field.config.nullable,
                            type: field.config.list ? 'one-to-many' : 'one-to-one',
                            cascade: true,
                        } as EntitySchemaRelationOptions;
                        break;
                }
            }
        });
        return new EntitySchema(schema);
    }
}
