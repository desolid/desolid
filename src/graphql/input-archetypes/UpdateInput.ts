import { NexusInputFieldConfig } from '@nexus/schema/dist/core';
import * as _ from 'lodash';
import { ModelMutationInput, UpdateManyRelationsInput } from '.';
import { FieldDefinition } from '../../schema';
import { Model } from '../../database';
import { Association, BelongsToMany, ModelCtor } from 'sequelize';

/**
 *
 * @todo handle update on relations: create,connect,delete
 */
export class UpdateInput extends ModelMutationInput {
    public static getObjectName(model: Model) {
        return `${model.name}UpdateInput`;
    }

    constructor(model: Model) {
        super(model, UpdateInput.getObjectName(model));
    }

    /**
     *
     * @todo handle file upload
     */
    protected getFieldConfig(field: FieldDefinition): NexusInputFieldConfig<string, string> {
        let type: any = field.type;
        let list: any = field.config.list;
        if (field.relation) {
            if (field.config.list) {
                type = UpdateManyRelationsInput;
                list = false;
            } else {
                type = 'Int';
            }
        }
        return {
            type,
            list,
            required: false,
        } as NexusInputFieldConfig<string, string>;
    }

    protected async validateAssosiations(input: any, leftId: number) {
        const assosiations = Object.values(this.model.datasource.associations);
        await Promise.all(
            assosiations.map(async (assosiation: BelongsToMany) => {
                const fieldName = this.getFieldNameFromAssosiation(assosiation);
                if (assosiation.isSingleAssociation) {
                    await this.model.assosiationSideExists(input[fieldName], assosiation);
                } else {
                    const values = [];
                    const { add, remove } = input[fieldName] as { add: number[]; remove: number[] };
                    add && values.push(...add);
                    remove && values.push(...remove);
                    await this.model.assosiationSideExists(values, assosiation);
                    // check if these relation exists before
                    const throughModel: ModelCtor<any> = (assosiation as any).throughModel;
                    const rows = await throughModel.findAll({
                        where: { [assosiation.identifier]: leftId, [assosiation.otherKey]: values },
                    });
                    if (add) {
                        add.forEach((id) => {
                            if (_.find(rows, { [assosiation.foreignKey]: leftId, [assosiation.otherKey]: id })) {
                                throw new Error(
                                    `${this.model.name} where { id: '${leftId}' } assosiates already with '${assosiation.target.name}' where { id: '${id}' } and asked to add the assosiation.`,
                                );
                            }
                        });
                    }
                    if (remove) {
                        remove.forEach((id) => {
                            if (!_.find(rows, { [assosiation.foreignKey]: leftId, [assosiation.otherKey]: id })) {
                                throw new Error(
                                    `${this.model.name} where { id: '${leftId}' } doesn't assosiate already with '${assosiation.target.name}' where { id: '${id}' } and asked to remove the assosiation.`,
                                );
                            }
                        });
                    }
                }
            }),
        );
    }

    public async validate(input: any, record: { id: number }) {
        await this.validateAssosiations(input, record.id);
    }
}
