import { inputObjectType } from '@nexus/schema/dist/core';

export const UpdateManyRelationsInput = inputObjectType({
    name: 'UpdateManyRelationsInput',
    description: 'Update many relations input object type',
    definition(t) {
        t.int('add', {
            description: '`ID`s of the assosiated models',
            required: false,
            list: [true],
        });
        t.int('remove', {
            description: '`ID`s of the assosiated models',
            required: false,
            list: [true],
        });
    },
});
