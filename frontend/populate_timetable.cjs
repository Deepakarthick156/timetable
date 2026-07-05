const { MongoClient } = require('mongodb'); 
(async () => { 
  const uri = 'mongodb+srv://kdeepakr156_db_user:1KAxqbF9UFXftsP1@cluster0.muh2juv.mongodb.net/college_assistant?appName=Cluster0'; 
  const client = new MongoClient(uri); 
  await client.connect(); 
  const db = client.db(); 
  
  const depts = await db.collection('departments').find().toArray();
  const years = await db.collection('academic_years').find().toArray();
  const sections = await db.collection('sections').find().toArray();
  const subjects = await db.collection('subjects').find().toArray();
  const faculty = await db.collection('faculty').find().toArray();
  const classrooms = await db.collection('classrooms').find().toArray();
  
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const timeslots = [
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:15', end: '12:15' },
      { start: '13:00', end: '14:00' },
      { start: '14:00', end: '15:00' },
      { start: '15:15', end: '16:15' }
  ];

  function getLocalTimeDate(timeStr) {
      // timeStr is 'HH:mm'
      // We need to create a Date object that matches what Spring Data MongoDB does.
      // Spring usually uses 1970-01-01 with the local time of the JVM.
      // Let's just create a date for today in local time.
      const d = new Date();
      const [h, m] = timeStr.split(':');
      d.setHours(parseInt(h, 10));
      d.setMinutes(parseInt(m, 10));
      d.setSeconds(0);
      d.setMilliseconds(0);
      return d;
  }

  let newTimetables = [];
  
  for (const dept of depts) {
      for (const year of years) {
          for (const sec of sections) {
              for (const day of days) {
                  for (const slot of timeslots) {
                      const subject = subjects[Math.floor(Math.random() * subjects.length)];
                      const fac = faculty[Math.floor(Math.random() * faculty.length)];
                      const room = classrooms[Math.floor(Math.random() * classrooms.length)];
                      
                      newTimetables.push({
                          departmentId: dept._id.toString(),
                          yearId: year._id.toString(),
                          sectionId: sec._id.toString(),
                          dayOfWeek: day,
                          startTime: getLocalTimeDate(slot.start),
                          endTime: getLocalTimeDate(slot.end),
                          subjectId: subject._id.toString(),
                          facultyId: fac._id.toString(),
                          classroomId: room._id.toString(),
                          _class: 'com.college.assistant.entity.Timetable'
                      });
                  }
              }
          }
      }
  }

  if (newTimetables.length > 0) {
      await db.collection('timetables').deleteMany({});
      await db.collection('timetables').insertMany(newTimetables);
      console.log(`Inserted ${newTimetables.length} timetable entries.`);
  }
  
  await client.close(); 
})();
