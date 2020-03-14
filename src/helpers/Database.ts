import { Model } from 'src/entities/Model';

export interface DatabaseConfig {
    type: string;
    file?: string;
}
export class Database {
    constructor(protected config: DatabaseConfig) {}
    public async start(models: Model[]) {}
}
