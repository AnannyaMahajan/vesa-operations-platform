const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : process.env.DB_PATH || path.join(__dirname, '../../data/vesa_workflow.db');

let dbInstance = null;

function saveDb() {
  if (dbPath !== ':memory:' && dbInstance) {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbPath, buffer);
  }
}

async function getDb() {
  if (!dbInstance) {
    const SQL = await initSqlJs();
    if (dbPath !== ':memory:' && fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      dbInstance = new SQL.Database(fileBuffer);
    } else {
      dbInstance = new SQL.Database();
    }
    initDbSchema();
  }
  return dbInstance;
}

function initDbSchema() {
  if (!dbInstance) return;
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    dbInstance.exec(schemaSql);
    saveDb();
  }
}

function query(sql, params = []) {
  if (!dbInstance) throw new Error('Database not initialized. Call getDb() first.');
  const stmt = dbInstance.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function get(sql, params = []) {
  const results = query(sql, params);
  return results.length > 0 ? results[0] : undefined;
}

function run(sql, params = []) {
  if (!dbInstance) throw new Error('Database not initialized. Call getDb() first.');
  dbInstance.run(sql, params);
  
  // Get last insert rowid & changes count
  const rowidResult = query('SELECT last_insert_rowid() as id');
  const changesResult = query('SELECT changes() as count');
  
  saveDb();
  return {
    lastInsertRowid: rowidResult.length > 0 ? rowidResult[0].id : 0,
    changes: changesResult.length > 0 ? changesResult[0].count : 0
  };
}

function exec(sql) {
  if (!dbInstance) throw new Error('Database not initialized. Call getDb() first.');
  dbInstance.exec(sql);
  saveDb();
}

module.exports = {
  getDb,
  initDbSchema,
  query,
  get,
  run,
  exec,
  saveDb
};
