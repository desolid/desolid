# 🤖 Desolid: Single file BaaS

<p align="center">
  <a href="https://npmcharts.com/compare/desolid?minimal=true"><img src="https://img.shields.io/npm/dm/desolid.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/desolid"><img src="https://img.shields.io/npm/v/desolid.svg" alt="Version"></a>  
  <a href="https://github.com/vuejs/desolid/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/desolid.svg" alt="License"></a>
  <a href="https://app.netlify.com/sites/desolid/deploys"><img src="https://api.netlify.com/api/v1/badges/e07ea82e-df51-4658-9897-64b95719bafd/deploy-status" alt="License"></a>
</p>

Open source, single file, self hosted, Backend as a service.

Documentation: [https://desolid.netlify.app/](https://desolid.netlify.app/)

Blog: [https://dev.to/desolid](https://dev.to/desolid)

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

    extend type User
        @model
        @authorization(
            CREATE: [Admin, Editor]
            READ: [Admin, "$user.id == {{id}}"]
            UPDATE: [Admin, "$user.id == {{id}}"]
            DELETE: [Admin] #
        ) {
        avatar: File @upload(accept: ["image/jpeg"], size: { max: "5", min: "0.1" })
    }

    """
    This is a description of a Post
    """
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

    """
    This is a description of a Category
    """
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
    - Must output something like this:

```bash
____                         _   _       _
|  _ \    ___   ___    ___   | | (_)   __| |
| | | |  / _ \ / __|  / _ \  | | | |  / _` |
| |_| | |  __/ \__ \ | (_) | | | | | | (_| |
|____/   \___| |___/  \___/  |_| |_|  \__,_|

🤖 Desolid: Single file self hosted backend as a service
🔥 v0.2.11 running in "win32" on "./home/user/app"

[2020-05-20 10:38:57]  INFO  Compiling Schema ...
[2020-05-20 10:38:57]  WARN  Authentication Secret value didn't set into configuration file. the genrated JWT tokens will expire on every restart.
[2020-05-20 10:38:57]  INFO  Connecting to database ...
[2020-05-20 10:38:57]  INFO  Connected to "sqlite://./databse.sqlite"
[2020-05-20 10:38:57]  INFO  Starting server ...
[2020-05-20 10:38:57]  INFO  Server is running on http://localhost:3000
[2020-05-20 10:38:57]  INFO  🚀 in 488ms
```

4. Open [http://localhost:3000/](http://localhost:3000/) on your browser.

## Acknowledgement

This project is based On these cool stuffs:

-   TypeScript: [https://github.com/Microsoft/TypeScript](https://github.com/Microsoft/TypeScript)
-   Sequlize: [https://github.com/sequelize/sequelize](https://github.com/sequelize/sequelize)
-   Nexus Schema: [https://github.com/graphql-nexus/schema](https://github.com/graphql-nexus/schema)
-   GraphQL Yoga: [https://github.com/prisma-labs/graphql-yoga](https://github.com/prisma-labs/graphql-yoga)
-   FlyDrive: [https://github.com/Slynova-Org/flydrive](https://github.com/Slynova-Org/flydrive)
