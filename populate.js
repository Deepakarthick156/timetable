const fs = require('fs');

async function populate() {
    console.log("Starting data population...");

    // 1. Authenticate to get a token
    const authRes = await fetch('http://localhost:8082/api/auth/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin2', password: 'password' })
    });
    if (!authRes.ok) {
        console.error("Auth failed");
        return;
    }
    const authData = await authRes.json();
    const token = authData.token;
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 2. Fetch all required entities
    console.log("Fetching existing data...");
    const fetchData = async (endpoint) => {
        const res = await fetch(`http://localhost:8082/api/admin/${endpoint}`, { headers });
        return res.json();
    };

    const departments = await fetchData('departments');
    const years = await fetchData('academicYears');
    const sections = await fetchData('sections');
    const subjects = await fetchData('subjects');
    const faculties = await fetchData('facultys');
    const classrooms = await fetchData('classrooms');

    console.log(`Found ${departments.length} departments, ${years.length} years, ${sections.length} sections.`);
    console.log(`Found ${subjects.length} subjects, ${faculties.length} faculty, ${classrooms.length} classrooms.`);

    if (!subjects.length || !faculties.length || !classrooms.length) {
        console.log("Not enough data to create timetables! Ensure subjects, faculty, and classrooms exist.");
        return;
    }

    const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
    const timeSlots = [
        { start: "09:00", end: "10:00" },
        { start: "10:00", end: "11:00" },
        { start: "11:15", end: "12:15" },
        { start: "13:00", end: "14:00" },
        { start: "14:00", end: "15:00" },
    ];

    let count = 0;

    // Helper to get random item
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    for (const dept of departments) {
        for (const year of years) {
            for (const sec of sections) {
                // For each day
                for (const day of days) {
                    // For each slot
                    for (const slot of timeSlots) {
                        const payload = {
                            departmentId: dept.id,
                            yearId: year.id,
                            sectionId: sec.id,
                            dayOfWeek: day,
                            startTime: slot.start + ":00",
                            endTime: slot.end + ":00",
                            subjectId: getRandom(subjects).id,
                            facultyId: getRandom(faculties).id,
                            classroomId: getRandom(classrooms).id
                        };

                        const res = await fetch('http://localhost:8082/api/admin/timetables', {
                            method: 'POST',
                            headers,
                            body: JSON.stringify(payload)
                        });

                        if (res.ok) {
                            count++;
                            if (count % 10 === 0) console.log(`Created ${count} timetable rows...`);
                        } else {
                            console.error("Failed to create timetable row:", await res.text());
                        }
                    }
                }
            }
        }
    }

    console.log(`Finished! Created ${count} timetable rows total.`);
}

populate().catch(console.error);
