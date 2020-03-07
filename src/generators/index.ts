import { Model } from './Model';
import { Enum } from './Enum';
import { Query } from './Query';
import { NexusObjectTypeDef } from 'nexus/dist/core';

export type TypeDef = Model | Enum | Query | NexusObjectTypeDef<'Mutation'>;

export { Model, Enum };
