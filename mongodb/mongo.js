const { MongoClient } = require('mongodb')
const client =new MongoClient(process.env.MONGO_URI)
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

