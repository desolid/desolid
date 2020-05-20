# Getting Started

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
        phone: PhoneNumber! @unique
        avatar: File @upload(accept: ["image/jpeg"], size: { max: 5, min: 0.1 })
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

4. Open (http://localhost:3000/)[http://localhost:3000/] on your browser.
