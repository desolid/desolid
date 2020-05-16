# Desolid: Single file BaaS

Single file self hosted backend as a service

Home page: ...
Documentation: ...
Blog: ...

## Features

-   GraphQL API: CRUDs
-   Authentication & Authorization: inline definition
-   File storage: Local and S3 support
-   Database agnostic: SQLite, MariaDB, PostgreSQL, MS SQL Server

## Quick start

Let's create an api for a blog service:

1. Install NodeJS
2. Create a desolid schema file: `schema.graphql`

    ```graphql
    extend enum UserGroup {
        Editor
        Author
    }

    type Post
        @model
        @authorization(
            READ: [Admin, Editor, "{{published}} || $user.id == {{author.id}}"]
            CREATE: [Admin, Editor, "$user.group == 'Author' && !$input.published"]
            UPDATE: [Admin, Editor, "$user.id == {{author.id}} && !$input.published"]
            DELETE: [Admin, Editor, "!{{published}} && $user.id == {{author.id}}"] #
        ) {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        author: User!
        title: String!
        content: String!
        published: Boolean!
        categories: [Category]
    }

    type Category
        @model
        @authorization(
            CREATE: [Admin, Editor]
            UPDATE: [Admin, Editor]
            DELETE: [Admin, Editor] #
        ) {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        name: String!
        posts: [Post]
    }
    ```

3. Run this command on your terminal

    ```bash
    npx desolid
    ```

    - Compiles the schema and creates CRUDs
    - Creates and uses by default a SQLite database on the root `./database.sqlite`
    - Stores files under `./upload` directory
    - Logs errors and warnings on `./desolid.log` file

4. Open http://localhost:3000/ on your browser.

## Acknowledgement

This project is based On these cool stuffs:

-   TypeScript: https://github.com/Microsoft/TypeScript
-   Sequlize: https://github.com/sequelize/sequelize
-   Nexus Schema: https://github.com/graphql-nexus/schema
-   GraphQL Yoga: https://github.com/prisma-labs/graphql-yoga
-   FlyDrive: https://github.com/Slynova-Org/flydrive
