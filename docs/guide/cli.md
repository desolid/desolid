# Desolid CLI


## Installation

```bash
npm inistall -g desolid
```

## Usage

For starting Desolid the only input argument is the root directory which by defualt is current working directory.

the root directory must contain at least the `schema.graphl` file.

### Starting on the current directory

For a quick usage without installation you can use NPX command

```bash
npx desolid
```

Or if you installed desolid as a global NPM package, you may use:

```bash
desolid
```

which must output like this:

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

### Starting on a custom directory

For starting Desolid on a custom directory you can use `-p` or `--path` argumant:

```bash
npx desolid --path /custom/path/api
```

### Getting version

For getting Desolid version you can use `-v` or `--version` argumant:

```bash
npx desolid --version
```

### Getting usage instructions help

For getting usage instructions help you can use `-h` or `--help` argumant:

```bash
npx desolid --help
```