import * as StorageManager from '@slynova/flydrive';
import * as streamToBuffer from 'stream-to-promise';
import * as path from 'path';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from 'apollo-server-core';
import { MapX } from '../utils';
import { TypeDefinition, UploadDirectiveArguments, FieldDefinition } from '../schema';
import { GraphQLResolveInfo } from 'graphql';
import { parseResolveInfo, ResolveTree } from 'graphql-parse-resolve-info';

enum StorageDrivers {
    LOCAL = 'local',
    S3 = 's3',
    GCS = 'gcs',
}

const MB = Math.pow(1024, 2);

// export type StorageConfig = StorageManagerSingleDiskConfig;

export interface StorageConfig {
    pattern: (values: any) => string;
    driver: StorageDrivers;
    config: {
        root?: string; // Using on `Local` driver
        key: string; // Using on `S3` driver
        secret: string; // Using on `S3` driver
        region: string; // Using on `S3` driver
        endpoint: string; // Using on `S3` driver
        bucket: string; // Using on `S3` & `GCS` drivers
        keyFilename: string; // Using on `GCS` driver
    };
}

export interface Upload {
    filename: string;
    mimetype: string;
    buffer: Buffer;
}

export class Storage {
    private readonly manager: StorageManager;

    constructor(
        private readonly configs: StorageConfig,
        root: string,
        private readonly models: MapX<string, TypeDefinition>,
    ) {
        this.configs.pattern = _.template((configs.pattern as any) as string);
        configs.config.root = path.join(root, configs.config.root);
        this.manager = new StorageManager({
            disks: {
                main: {
                    driver: configs.driver,
                    config: configs.config,
                },
            },
            default: 'main',
        });
    }

    public get disk() {
        return this.manager.disk();
    }

    public get middleware() {
        return this._middleware.bind(this);
    }

    private async processDataInput(typeDefinition: TypeDefinition, input: any) {
        for (let [key, value] of Object.entries<any>(input)) {
            if (value instanceof Promise) {
                const { filename, mimetype, createReadStream } = await value;
                const buffer: Buffer = await streamToBuffer(createReadStream());
                input[key] = { filename, mimetype, buffer };
                this.validate(typeDefinition.fields.get(key), input[key]);
            }
        }
    }

    private async _middleware(resolve, root, args, context, info: GraphQLResolveInfo) {
        if (args.data) {
            const resolveTree = parseResolveInfo(info) as ResolveTree;
            const [modelName] = Object.keys(resolveTree.fieldsByTypeName);
            const typeDefinition = this.models.get(modelName);
            if (_.isArray(args.data)) {
                const inputs: any[] = args.data;
                await Promise.all(inputs.map((input) => this.processDataInput(typeDefinition, input)));
            } else {
                await this.processDataInput(typeDefinition, args.data);
            }
        }
        return resolve(root, args, context, info);
    }

    private generateFilename(filename: string) {
        const { name, ext } = path.parse(filename);
        const [MM, DD, YYYY] = new Date().toLocaleDateString('en-US').split('/');
        return this.configs.pattern({
            EXT: ext.substr(1),
            NAME: name,
            FILENAME: filename,
            EPOCH: Date.now(),
            UUID: uuidv4(),
            MM,
            DD,
            YYYY,
        });
    }
    /**
     *
     * @param upload
     * @returns fileId
     */
    public async save({ filename, buffer }: Upload) {
        const path = this.generateFilename(filename);
        await this.disk.put(path, buffer);
        return path;
    }

    public async delete(path: string) {
        return this.disk.delete(path);
    }

    // public async delete(fileId: number) {
    //     const file = await this.fileModel.datasource.findByPk(fileId, { attributes: ['path'] });
    //     await this.disk.delete(file.path);
    //     await this.fileModel.datasource.destroy({ where: { id: fileId } });
    // }

    private validate(field: FieldDefinition, { filename, mimetype, buffer }: Upload) {
        const conditions = field.directives.get('upload') as UploadDirectiveArguments;
        if (conditions) {
            if (_.isArray(conditions.accept) && !_.includes(conditions.accept, mimetype)) {
                throw new ValidationError(
                    `"${filename}" is not accespatble (wrong mimetype: ${mimetype}), you can use ${conditions.accept.join(
                        ', ',
                    )}.`,
                );
            }
            if (conditions.size) {
                const { max, min } = conditions.size;
                const size = buffer.length / MB;

                if (max && max < size) {
                    throw new ValidationError(
                        `"${filename}" is not accespatble (wrong size: ${size.toFixed(
                            2,
                        )} MB), the size must be less than ${max} MB.`,
                    );
                }

                if (conditions.size?.min > buffer.length) {
                    throw new ValidationError(
                        `"${filename}" is not accespatble (wrong size: ${size.toFixed(
                            2,
                        )} MB), the size must be greater than ${min} MB.`,
                    );
                }
            }
        }
    }
}
