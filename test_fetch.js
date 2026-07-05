const fs = require('fs');

async function testFetch() {
    const authRes = await fetch('http://localhost:8082/api/auth/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin2', password: 'password' })
    });
    const authData = await authRes.json();
    const token = authData.token;
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const endpoints = ['departments', 'years', 'sections', 'subjects', 'faculty', 'classrooms'];
    for (const ep of endpoints) {
        const res = await fetch(`http://localhost:8082/api/admin/${ep}`, { headers });
        const text = await res.text();
        console.log(`Endpoint ${ep} returned:`, text);
    }
}

testFetch().catch(console.error);
