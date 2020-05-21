import { Authorization, AuthorizationCategory, User } from './Authorization';
import { Model, Record } from '../../database';
import { warn } from '../../utils';

export class UserAuthorization extends Authorization {
    private adminUserExists = false;
    constructor(private readonly model: Model) {
        super(model.typeDefinition);
    }

    /**
     * Desolid skips `User` model authorization till the first `Admin` user creation. so it's recommanded to create the admin user as the first usage of the api.
     * @param category
     * @param user
     * @param record
     * @param input
     */
    protected async authorize(category: AuthorizationCategory, user: User, record: User, input?: any) {
        try {
            await super.authorize(category, user, record);
            if (category == AuthorizationCategory.DELETE && record.group == 'Admin') {
                this.adminUserExists = false;
            }
        } catch (error) {
            if (this.adminUserExists) {
                throw error;
            } else {
                const adminUsersCount = await this.countAdminUsers();
                if (adminUsersCount > 0) {
                    this.adminUserExists = true;
                    throw error;
                } else {
                    warn(`Skipping authorization on User model, till the first 'Admin' user creation.`);
                }
            }
        }
    }

    protected countAdminUsers() {
        return this.model.datasource.count({ where: { group: 'Admin' } });
    }
}
