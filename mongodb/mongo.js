const { MongoClient } = require('mongodb')
const client = new MongoClient(process.env.MONGO_URI)
let db;

async function connect() {
  if (!db) {
    await client.connect()
    db = client.db('Wardrobe')
  }
  return db
}

function getDb() {
  if (!db) {
    throw new Error('Database not connected. Call connect() first.')
  }
  return db
}

module.exports = { connect, getDb }

