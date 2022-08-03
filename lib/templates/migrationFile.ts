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
exports.up = async (client) => {
  const filePath = path.join(__dirname, 'sqls','${upDownRelativePath}-up.sql');
  const contents = await fs.promises.readFile(filePath, { encoding: 'utf-8' });

  const script = contents.replace(/__(.*?)__/g, (group1, group2) => process.env[group2] || '');

  console.log('[NOMADIC]:', 'migrating up', '${upDownRelativePath}');

  console.log(script);

  return client.query(script);
};

exports.down = async (client) => {
  const filePath = path.join(__dirname, 'sqls','${upDownRelativePath}-down.sql');
  const contents = await fs.promises.readFile(filePath, { encoding: 'utf-8' });

  const script = contents.replace(/__(.*?)__/g, (group1, group2) => process.env[group2] || '');

  console.log('[NOMADIC]:', 'migrating down', '${upDownRelativePath}');

  console.log(script);

  return client.query(script);
};
`;
}