async function test() {
  try {
    const regRes = await fetch('http://localhost:8082/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: 'teststudent_01', 
        password: 'password123',
        role: 'STUDENT',
        registerNumber: 'REG_TEST_01',
        name: 'Test Student',
        departmentId: '6a4942889db8434508ec8e19', // Just hardcoding any valid id for test
        yearId: '6a4942899db8434508ec8e22',
        sectionId: '6a4942899db8434508ec8e26'
      })
    });
    console.log("Register status:", regRes.status);
    if (!regRes.ok) console.log(await regRes.text());

    const loginRes = await fetch('http://localhost:8082/api/auth/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'teststudent_01', password: 'password123' })
    });
    console.log("Login status:", loginRes.status);
    if (!loginRes.ok) {
      console.log(await loginRes.text());
      return;
    }
    const token = (await loginRes.json()).token;
    console.log("Login successful! Token:", token.substring(0, 10));

    const endpoints = [
      '/student/profile',
      '/student/announcements',
      '/admin/holidays',
      '/student/exams',
      '/student/assessments',
      '/student/attendance',
      '/student/internalMarks',
      '/student/timetable'
    ];
    for (const ep of endpoints) {
      const res = await fetch('http://localhost:8082/api' + ep, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(ep, "->", res.status);
      if (!res.ok) console.log(await res.text());
    }

    const chatRes = await fetch('http://localhost:8082/api/student/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ question: "hi", history: "" })
    });
    console.log("Chat status:", chatRes.status);
    if (chatRes.ok) {
      console.log("Chat response:", await chatRes.json());
    } else {
      console.log("Chat error:", await chatRes.text());
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
