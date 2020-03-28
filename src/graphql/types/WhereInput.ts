import { NexusInputObjectTypeDef, NexusInputFieldConfig, InputDefinitionBlock } from 'nexus/dist/core';
import { Model } from '.';
import { Schema } from '../Schema';
import { Input } from './Input';

export class WhereInput extends Input {
    constructor(protected readonly model: Model, protected schema: Schema) {
        super(model, schema, `${model.name}WhereInput`);
    }
}
