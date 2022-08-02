export default function(upDownRelativePath: string) {
  return `
const path = require('path');
const fs = require('fs/promises');

// note: client is an instance of node-pg Client
exports.up = async (client) => {
  const filePath = path.join(__dirname, 'sqls','${upDownRelativePath}-up.sql');
  const contents = await fs.readFile(filePath, { encoding: 'utf-8' });

  const script = contents.replace(/__(.*?)__/g, (group1, group2) => process.env[group2] || '');

  return client.query(script);
};

exports.down = async (client) => {
  const filePath = path.join(__dirname, 'sqls','${upDownRelativePath}-down.sql');
  const contents = await fs.readFile(filePath, { encoding: 'utf-8' });

  const script = contents.replace(/__(.*?)__/g, (group1, group2) => process.env[group2] || '');

  return client.query(script);
};
`;
}