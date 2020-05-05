import { StorageManager, StorageManagerSingleDiskConfig } from '@slynova/flydrive/src';
import * as path from 'path';

enum StorageDrivers {
    LOCAL = 'local',
    S3 = 's3',
    GCS = 'gcs',
}

// export type StorageConfig = StorageManagerSingleDiskConfig;

export interface StorageConfig {
    pattern: string;
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

export class Storage {
    private readonly manager: StorageManager;
    constructor(private readonly configs: StorageConfig, root: string) {
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
}
