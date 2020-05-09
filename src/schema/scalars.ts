// import { GraphQLUpload } from 'graphql-upload';
import * as StandardScalars from 'graphql-scalars';
import * as md5 from 'md5';
import { NexusScalarTypeDef, scalarType } from '@nexus/schema/dist/core';
import { StringValueNode, ScalarLeafsRule } from 'graphql';

export type Scalar =
    // primitives
    | 'ID'
    | 'Int'
    | 'Float'
    | 'Boolean'
    | 'DateTime'
    | 'String'
    // standard scalars
    | 'DateTime'
    | 'EmailAddress'
    | 'NegativeFloat'
    | 'NegativeInt'
    | 'NonNegativeFloat'
    | 'NonNegativeInt'
    | 'NonPositiveFloat'
    | 'NonPositiveInt'
    | 'PhoneNumber'
    | 'PositiveFloat'
    | 'PositiveInt'
    | 'PostalCode'
    | 'UnsignedFloat'
    | 'UnsignedInt'
    | 'URL'
    | 'ObjectID'
    | 'BigInt'
    | 'Long'
    | 'GUID'
    | 'HexColorCode'
    | 'HSL'
    | 'HSLA'
    | 'IPv4'
    | 'IPv6'
    | 'ISBN'
    | 'MAC'
    | 'Port'
    | 'RGB'
    | 'RGBA'
    | 'USCurrency'
    | 'JSON'
    | 'JSONObject'
    // custome scalars
    | 'Upload'
    | 'Password';

export const scalarTypes: Scalar[] = [
    // primitives
    'ID',
    'Int',
    'Float',
    'Boolean',
    'DateTime',
    'String',
    // standard scalars
    'DateTime',
    'EmailAddress',
    'NegativeFloat',
    'NegativeInt',
    'NonNegativeFloat',
    'NonNegativeInt',
    'NonPositiveFloat',
    'NonPositiveInt',
    'PhoneNumber',
    'PositiveFloat',
    'PositiveInt',
    'PostalCode',
    'UnsignedFloat',
    'UnsignedInt',
    'URL',
    'ObjectID',
    'BigInt',
    'Long',
    'GUID',
    'HexColorCode',
    'HSL',
    'HSLA',
    'IPv4',
    'IPv6',
    'ISBN',
    'MAC',
    'Port',
    'RGB',
    'RGBA',
    'USCurrency',
    'JSON',
    'JSONObject',
    // custome scalars
    'Upload',
    'Password',
];

export const scalars = Object.keys(StandardScalars)
    .map<NexusScalarTypeDef<string>>((key) => {
        if (StandardScalars.hasOwnProperty(key) && /\w+Resolver$/.test(key)) {
            return scalarType(StandardScalars[key]);
        }
    })
    .filter((scalar) => scalar);

// scalars.push(scalarType(GraphQLUpload));
scalars.push(scalarType({
    name: 'Upload',
} as any));
scalars.push(
    scalarType({
        name: 'Password',
        description: 'Password hash',
        /**
         * Value sent to the client
         * @param value 
         */
        serialize(value) {
            throw new Error('Password could not pass to the client.');
        },

        /**
         * @todo implement
         */
        parseValue(value) {
            debugger;
            return value;
        },

        parseLiteral({ value }: StringValueNode) {
            return md5(value);
        },
    }),
);

export const stringScalars = [
    // primitives
    'String',
    // standard scalars
    'EmailAddress',
    'PhoneNumber',
    'PostalCode',
    'URL',
    'HexColorCode',
    'HSL',
    'HSLA',
    'IPv4',
    'IPv6',
    'ISBN',
    'MAC',
    'RGB',
    'RGBA',
];
