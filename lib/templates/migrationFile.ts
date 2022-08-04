export default function(upDownRelativePath: string) {
  return `
const path = require('path');
const fs = require('fs');

// only for backwards compat with node-db-migrate
exports.setup = function(options, seedLink) {
  // dbm = options.dbmigrate;
  // type = dbm.dataType;
  // seed = seedLink;
  // Promise = options.Promise;
};

// note: client is an instance of node-pg Client
exports.up = async (client, transform) => {
  const filePath = path.join(__dirname, 'sqls','${upDownRelativePath}-up.sql');
  
  let script = await fs.promises.readFile(filePath, { encoding: 'utf-8' });

  if (transform) {
    script = await transform(script);
  }

  console.log('[nomadic]:', 'migrating up', '${upDownRelativePath}');

  console.log(script);

  return client.query(script);
};

exports.down = async (client, transform) => {
  const filePath = path.join(__dirname, 'sqls','${upDownRelativePath}-down.sql');
  let script = await fs.promises.readFile(filePath, { encoding: 'utf-8' });

  if (transform) {
    script = await transform(script);
  }

  console.log('[nomadic]:', 'migrating down', '${upDownRelativePath}');

  console.log(script);

  return client.query(script);
};
`;
}