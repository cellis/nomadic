
<img src="imgs/DALL-E-A-nomad-with-brown-skin-and-cream-clothing-holding-a-spear-and-leading-a-green-elephant-through-a-desert.png" width="250" title="dalle nomad with elephant"><img src="imgs/DALL-E-A-nomad-with-brown-skin-and-cream-clothing-holding-a-spear-and-walking-with-an-elephant-through-a-desert.png" width="250" title="dalle nomad with elephant">

# nomadic

## Installation
```
yarn install nomadic
```
A simple postgres migration tool built for both CLI and library usage.

## Usage

### CLI Usage
```sh
$ yarn nomadic create hello-world;  yarn nomadic; yarn nomadic down;
```

### Library Usage
```typescript
import { up, down, create, migrate } from 'nomadic';
import { Nomadic } from 'nomadic/lib/nomadic';
```

## Configuration

You can configure nomadic in 3 ways.

* Use nomadic.config.js (recommended)
* Import it to use as a library (advanced)
* Pass cli arguments 

To see the arguments to pass run `yarn nomadic help`; nomadic will also merge cli arguments with `nomadic.config.js` values. 

NOTE: `nomadic.config.js` values will 
overwrite cli argument values.

Example `nomadic.config.js`:

```js
module.exports = {
  host: 'localhost', // url to your db server
  database: 'nomadic', 
  migrations: 'migrations', // directory you want migrations placed in, relative to current working directory
  port: 5432,
  user: 'postgres',
  password: '',
  preHooks: { // optional prehooks
    up: async (client) => {
      //...do something before all UP migrations are run here
    },
    down: async (client) => {
      //...do something before all DOWN migrations are run here
    },
    create: async (client) => {
      //...do something before running create here
    }
  },
  hooks: { // optional hooks
    // client is an instance of pg.Client
    up: async (client) => {
      //...do something after all UP migrations are run here
    },
    down: async (client) => {
      //...do something after all DOWN migrations are run here
    },
    create: async (client) => {
      //...do something after running create here
    }
  }
}
```

### Creating migrations

```sh
$ yarn nomadic create <name-of-migration>
```

This will create 3 files;

* A `<name-of-migration>`.js file, which you can edit to run other Javascript on your up or down migrations.
* A `<name-of-migration>`-up.sql file with sql to make database schema changes
* A `<name-of-migration>`-down.sql file with sql to reverse the up database schema changes

### Up migrations

Running `yarn nomadic` or `yarn nomadic up` will by default run all the up migrations that haven't been run.
You can also run e.g. `yarn nomadic up 5` to migrate your db up 5 migrations.

### Down migrations

To go down a migration:
`yarn nomadic down` will by default run 1 migration down at a time.
You can also run e.g. `yarn nomadic down 5`.

### Transforms

If you want to transform all sql code, you can pass a `transform` [`(sql: string) => Promise<string>`] option either in the `nomadic.config.js` or in the library options. It takes an sql string and returns whatever you want. It is passed as a function to all of your `<name-of-migration>.js` `up` and `down` functions. So you can rewrite sql / interpolate environment variables if needed.

### Hooks & PreHooks ( 0.1.25 )

Hooks (see above) allow you to run cleanup tasks after migration operations are done. For instance you may want to dump the schema, restart your dev server, etc.

Prehooks allow you to run tasks before migration operations are done.

