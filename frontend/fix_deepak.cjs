const { MongoClient } = require('mongodb'); 
(async () => { 
  const uri = 'mongodb+srv://kdeepakr156_db_user:1KAxqbF9UFXftsP1@cluster0.muh2juv.mongodb.net/college_assistant?appName=Cluster0'; 
  const client = new MongoClient(uri); 
  await client.connect(); 
  const db = client.db(); 
  const user = await db.collection('users').findOne({ username: 'Deepak' }); 
  if (user) { 
    const userId = user._id.toString(); 
    const update = await db.collection('students').updateOne({ registerNumber: '922523104019' }, { $set: { userId: userId } }); 
    console.log('Updated user ID for Deepak:', update.modifiedCount); 
  } else { 
    console.log('User Deepak not found!'); 
  } 
  await client.close(); 
})();
