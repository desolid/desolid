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

[2020-05-19 05:21:44]  info  Compiling Schema ...
[2020-05-19 05:21:45]  info  Connecting to database ...
[2020-05-19 05:21:45]  info  Connected to "sqlite://databse.sqlite"
[2020-05-19 05:21:45]  info  Starting server ...
[2020-05-19 05:21:45]  info  Server is running on http://localhost:3000
[2020-05-19 05:21:45]  info  🚀 in 658ms
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