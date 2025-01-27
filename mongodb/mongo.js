const { MongoClient } = require('mongodb')
const client =new MongoClient('mongodb://localhost:27017/')
let db;
const returndb=async function(){
  if(!db){
    await client.connect()
    db=client.db('Wardrobe')
    return db
  }
  else{
    return db
  }
}
module.exports=returndb

