import { createConnection, EntitySchema, ConnectionOptions } from 'typeorm';
import { Model } from 'src/entities/Model';

export type DatabaseConfig = ConnectionOptions;
export class Database {
    constructor(protected config: DatabaseConfig) {}
    public async start(models: Model[]) {
        const entities = models.map((model) => new EntitySchema(model.schema));
        const connection = await createConnection({
            ...this.config,
            synchronize: true,
            entities,
        });
    }
}
