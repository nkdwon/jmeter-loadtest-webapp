// db.js
const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const dbFile = path.join(__dirname, 'data.db')
const db = new sqlite3.Database(dbFile)

function init() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      price REAL
    )`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`)
    db.run(
      `CREATE INDEX IF NOT EXISTS idx_products_description ON products(description)`
    )

    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      qty INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`)
  })
}

module.exports = { db, init }
