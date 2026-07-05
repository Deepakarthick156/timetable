const { MongoClient, ObjectId } = require('mongodb'); 
(async () => { 
  const uri = 'mongodb+srv://kdeepakr156_db_user:1KAxqbF9UFXftsP1@cluster0.muh2juv.mongodb.net/college_assistant?appName=Cluster0'; 
  const client = new MongoClient(uri); 
  await client.connect(); 
  const db = client.db(); 
  // Get earliest timetables
  const t = await db.collection('timetables').find({}).sort({_id: 1}).limit(5).toArray();
  console.log('original timetable:', JSON.stringify(t, null, 2));
  await client.close(); 
})();
