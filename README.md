# Prismax

Please note that this repository serves as an example of one way that I've found to set up a minimal project which allows for debugging TypeScript that is running on Node in VSCode. At the time of writing I've only tested on a x64 based Windows 10 machine and have not verified that the same steps work in a multitude of other configurations or environments. Please note also the [prerequisites](#prerequisites) as well as an indication of what worked for me.

## Prerequisites:

-   VSCode (tested with v1.25.1)
-   NodeJS (tested with v0.10.9)
-   NPM (tested with v6.1.0)

## Usage

Install node package dependencies (typescript and ts-node):

```bash
npm install
```

Start up VSCode if you haven't already (tested with VSCode v1.25.1):

```bash
code .
```

Set a breakpoint on one of the lines such as line 5 in [index.ts](/index.ts) and start debugging by pressing the `F5` key or select `Debug: Start Debugging` form the VSCode command pallet.

### Start

```bash
npm start
```

### Development (nodemon)

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Fromatting all source codes

```bash
npm run format
```

### Versioning

Updates version within `package.json` & updates change log on the root & creates a new tag in git and pushes all changes in the origin reposiotory.

Realeasing a Patch

```bash
npm run release:patch
```

Realeasing a Minor

```bash
npm run release:minor
```

Realeasing a Major

```bash
npm run release:major
```
