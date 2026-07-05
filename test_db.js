const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('college_assistant');

    const deepakUser = await db.collection('users').findOne({ username: 'Deepak' });
    console.log("Deepak User:", deepakUser);
    if (deepakUser) {
      const deepakStudent = await db.collection('students').findOne({ userId: deepakUser._id.toString() });
      console.log("Deepak Student:", deepakStudent);
    }

  } finally {
    await client.close();
  }
}
main().catch(console.error);
