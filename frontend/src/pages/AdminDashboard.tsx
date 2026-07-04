import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CalendarPlus,
  ClipboardList,
  GraduationCap,
  Layers,
  LogOut,
  Megaphone,
  Moon,
  Pencil,
  Plus,
  Search,
  Sun,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { api } from '../lib/axiosInstance';
import { useDarkMode } from '../hooks/useDarkMode';
import { useAuthStore } from '../store/useAuthStore';

type Entity = Record<string, any>;

const simpleResources = [
  { key: 'departments', label: 'Departments', endpoint: '/admin/departments', icon: GraduationCap, fields: ['name', 'code'] },
  { key: 'academicYears', label: 'Years', endpoint: '/admin/academicYears', icon: Layers, fields: ['yearName', 'level'] },
  { key: 'sections', label: 'Sections', endpoint: '/admin/sections', icon: Users, fields: ['name'] },
  { key: 'subjects', label: 'Subjects', endpoint: '/admin/subjects', icon: BookOpen, fields: ['name', 'code', 'type'] },
  { key: 'classrooms', label: 'Classrooms', endpoint: '/admin/classrooms', icon: CalendarPlus, fields: ['roomNumber', 'type', 'address'] },
  { key: 'holidays', label: 'Holidays', endpoint: '/admin/holidays', icon: CalendarPlus, fields: ['name', 'holidayDate', 'type'] },
];

const navItems = [
  ...simpleResources,
  { key: 'announcements', label: 'Announcements', icon: Megaphone },
  { key: 'facultys', label: 'Faculty', icon: Users },
  { key: 'timetables', label: 'Timetable', icon: CalendarPlus },
  { key: 'assessments', label: 'Assessments', icon: ClipboardList },
  { key: 'exams', label: 'Exams', icon: BookOpen },
  { key: 'attendance', label: 'Attendance', icon: Users },
  { key: 'internalMarks', label: 'Internal Marks', icon: ClipboardList },
  { key: 'students', label: 'Students', icon: UserPlus },
];

const blankTimetable = {
  departmentId: '',
  yearId: '',
  sectionId: '',
  dayOfWeek: 'MONDAY',
  startTime: '09:00',
  endTime: '10:00',
  subjectId: '',
  facultyId: '',
  classroomId: '',
};

const blankAssessment = {
  title: '',
  assessmentDate: '',
  maxMarks: '25',
  departmentId: '',
  yearId: '',
  sectionId: '',
  subjectId: '',
};

const blankExam = {
  examName: '',
  examDate: '',
  startTime: '10:00',
  endTime: '13:00',
  departmentId: '',
  yearId: '',
  sectionId: '',
  subjectId: '',
  classroomId: '',
};

const blankAttendance = {
  studentId: '',
  subjectId: '',
  totalClasses: '40',
  attendedClasses: '36',
};

const blankInternalMark = {
  studentId: '',
  subjectId: '',
  assessmentName: '',
  marks: '18',
  maxMarks: '20',
};

const blankStudent = {
  username: '',
  password: '',
  registerNumber: '',
  name: '',
  departmentId: '',
  yearId: '',
  sectionId: '',
};

export default function AdminDashboard() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [active, setActive] = useState(navItems[0].key);
  const [data, setData] = useState<Record<string, Entity[]>>({});
  const [editingIds, setEditingIds] = useState<Record<string, string | null>>({});
  const [forms, setForms] = useState<Record<string, Entity>>({});
  const [timetableForm, setTimetableForm] = useState(blankTimetable);
  const [assessmentForm, setAssessmentForm] = useState(blankAssessment);
  const [examForm, setExamForm] = useState(blankExam);
  const [attendanceForm, setAttendanceForm] = useState(blankAttendance);
  const [internalMarkForm, setInternalMarkForm] = useState(blankInternalMark);
  const [studentForm, setStudentForm] = useState(blankStudent);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', targetDepartmentId: '', targetYearId: '' });

  const departments = data.departments ?? [];
  const years = data.academicYears ?? [];
  const sections = data.sections ?? [];
  const subjects = data.subjects ?? [];
  const faculty = data.facultys ?? [];
  const classrooms = data.classrooms ?? [];
  const timetable = data.timetables ?? [];
  const students = data.students ?? [];

  useEffect(() => {
    loadAll();
  }, []);

  const stats = useMemo(
    () => [
      { label: 'Departments', value: departments.length, icon: GraduationCap },
      { label: 'Timetable Rows', value: timetable.length, icon: CalendarPlus },
      { label: 'Students', value: students.length, icon: Users },
      { label: 'Faculty', value: faculty.length, icon: Users },
    ],
    [departments.length, faculty.length, students.length, timetable.length],
  );

  const loadAll = async () => {
    const requests = [
      ...simpleResources.map((resource) => api.get(resource.endpoint).then((res) => [resource.key, res.data]).catch(() => [resource.key, []])),
      api.get('/admin/announcements').then((res) => ['announcements', res.data]).catch(() => ['announcements', []]),
      api.get('/admin/timetables').then((res) => ['timetables', res.data]).catch(() => ['timetables', []]),
      api.get('/admin/facultys').then((res) => ['facultys', res.data]).catch(() => ['facultys', []]),
      api.get('/admin/assessments').then((res) => ['assessments', res.data]).catch(() => ['assessments', []]),
      api.get('/admin/attendance').then((res) => ['attendance', res.data]).catch(() => ['attendance', []]),
      api.get('/admin/internalMarks').then((res) => ['internalMarks', res.data]).catch(() => ['internalMarks', []]),
      api.get('/admin/exams').then((res) => ['exams', res.data]).catch(() => ['exams', []]),
      api.get('/admin/students').then((res) => ['students', res.data]).catch(() => ['students', []]),
    ];
    const entries = await Promise.all(requests);
    setData(Object.fromEntries(entries));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const createResource = async (resource: (typeof simpleResources)[number]) => {
    const payload = forms[resource.key] ?? {};
    const editingId = editingIds[resource.key];
    if (editingId) {
      await api.put(`${resource.endpoint}/${editingId}`, normalizePayload(payload));
      setEditingIds((prev) => ({ ...prev, [resource.key]: null }));
    } else {
      await api.post(resource.endpoint, normalizePayload(payload));
    }
    setForms((prev) => ({ ...prev, [resource.key]: {} }));
    await loadAll();
  };

  const deleteResource = async (endpoint: string, id: string) => {
    await api.delete(`${endpoint}/${id}`);
    await loadAll();
  };

  const createFaculty = async () => {
    const payload = forms.facultys ?? {};
    const editingId = editingIds['facultys'];
    const data = {
      name: payload.name,
      department: payload.departmentId ? { id: payload.departmentId } : null,
    };
    if (editingId) {
      await api.put(`/admin/facultys/${editingId}`, data);
      setEditingIds((prev) => ({ ...prev, facultys: null }));
    } else {
      await api.post('/admin/facultys', data);
    }
    setForms((prev) => ({ ...prev, facultys: {} }));
    await loadAll();
  };

  const createTimetable = async () => {
    const editingId = editingIds['timetables'];
    const data = {
      dayOfWeek: timetableForm.dayOfWeek,
      startTime: timetableForm.startTime,
      endTime: timetableForm.endTime,
      department: { id: timetableForm.departmentId },
      year: { id: timetableForm.yearId },
      section: { id: timetableForm.sectionId },
      subject: { id: timetableForm.subjectId },
      faculty: { id: timetableForm.facultyId },
      classroom: { id: timetableForm.classroomId },
    };
    if (editingId) {
      await api.put(`/admin/timetables/${editingId}`, data);
      setEditingIds((prev) => ({ ...prev, timetables: null }));
    } else {
      await api.post('/admin/timetables', data);
    }
    setTimetableForm(blankTimetable);
    await loadAll();
  };

  const createAnnouncement = async () => {
    const editingId = editingIds['announcements'];
    const data = {
      title: announcementForm.title,
      content: announcementForm.content,
      targetDepartment: announcementForm.targetDepartmentId ? { id: announcementForm.targetDepartmentId } : null,
      targetYear: announcementForm.targetYearId ? { id: announcementForm.targetYearId } : null,
    };
    if (editingId) {
      await api.put(`/admin/announcements/${editingId}`, data);
      setEditingIds((prev) => ({ ...prev, announcements: null }));
    } else {
      await api.post('/admin/announcements', data);
    }
    setAnnouncementForm({ title: '', content: '', targetDepartmentId: '', targetYearId: '' });
    await loadAll();
  };

  const createAssessment = async () => {
    const editingId = editingIds['assessments'];
    const data = {
      title: assessmentForm.title,
      assessmentDate: assessmentForm.assessmentDate,
      maxMarks: Number(assessmentForm.maxMarks),
      department: { id: assessmentForm.departmentId },
      year: { id: assessmentForm.yearId },
      section: { id: assessmentForm.sectionId },
      subject: { id: assessmentForm.subjectId },
    };
    if (editingId) {
      await api.put(`/admin/assessments/${editingId}`, data);
      setEditingIds((prev) => ({ ...prev, assessments: null }));
    } else {
      await api.post('/admin/assessments', data);
    }
    setAssessmentForm(blankAssessment);
    await loadAll();
  };

  const createExam = async () => {
    const editingId = editingIds['exams'];
    const data = {
      examName: examForm.examName,
      examDate: examForm.examDate,
      startTime: examForm.startTime,
      endTime: examForm.endTime,
      department: { id: examForm.departmentId },
      year: { id: examForm.yearId },
      section: { id: examForm.sectionId },
      subject: { id: examForm.subjectId },
      classroom: { id: examForm.classroomId },
    };
    if (editingId) {
      await api.put(`/admin/exams/${editingId}`, data);
      setEditingIds((prev) => ({ ...prev, exams: null }));
    } else {
      await api.post('/admin/exams', data);
    }
    setExamForm(blankExam);
    await loadAll();
  };

  const createAttendance = async () => {
    const editingId = editingIds['attendance'];
    const data = {
      totalClasses: Number(attendanceForm.totalClasses),
      attendedClasses: Number(attendanceForm.attendedClasses),
      student: { id: attendanceForm.studentId },
      subject: { id: attendanceForm.subjectId },
    };
    if (editingId) {
      await api.put(`/admin/attendance/${editingId}`, data);
      setEditingIds((prev) => ({ ...prev, attendance: null }));
    } else {
      await api.post('/admin/attendance', data);
    }
    setAttendanceForm(blankAttendance);
    await loadAll();
  };

  const createInternalMark = async () => {
    const editingId = editingIds['internalMarks'];
    const data = {
      assessmentName: internalMarkForm.assessmentName,
      marks: Number(internalMarkForm.marks),
      maxMarks: Number(internalMarkForm.maxMarks),
      student: { id: internalMarkForm.studentId },
      subject: { id: internalMarkForm.subjectId },
    };
    if (editingId) {
      await api.put(`/admin/internalMarks/${editingId}`, data);
      setEditingIds((prev) => ({ ...prev, internalMarks: null }));
    } else {
      await api.post('/admin/internalMarks', data);
    }
    setInternalMarkForm(blankInternalMark);
    await loadAll();
  };

  const createStudent = async () => {
    try {
      const editingId = editingIds['students'];
      const data = {
        username: studentForm.username,
        password: studentForm.password,
        role: 'STUDENT',
        registerNumber: studentForm.registerNumber,
        name: studentForm.name,
        departmentId: studentForm.departmentId,
        yearId: studentForm.yearId,
        sectionId: studentForm.sectionId,
      };
      if (editingId) {
        await api.put(`/admin/students/${editingId}`, {
          registerNumber: studentForm.registerNumber,
          name: studentForm.name,
          department: { id: studentForm.departmentId },
          year: { id: studentForm.yearId },
          section: { id: studentForm.sectionId },
        });
        setEditingIds((prev) => ({ ...prev, students: null }));
      } else {
        await api.post('/auth/register', data);
      }
      setStudentForm(blankStudent);
      await loadAll();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save student account. Make sure the register number is unique.');
    }
  };

  const activeSimpleResource = simpleResources.find((resource) => resource.key === active);

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 text-white">
              <GraduationCap size={22} />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Admin Portal</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">College academic data management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Toggle dark mode"
              onClick={toggleDarkMode}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 p-4 lg:p-6">
        <div className="grid gap-3 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                  <Icon size={18} className="text-emerald-600" />
                </div>
                <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={`mb-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium ${
                    active === item.key
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon size={16} /> {item.label}
                </button>
              );
            })}
          </aside>

          <section className="space-y-4">
            {activeSimpleResource && (
              <ResourcePanel
                resource={activeSimpleResource}
                rows={data[activeSimpleResource.key] ?? []}
                form={forms[activeSimpleResource.key] ?? {}}
                setForm={(next: Entity) => setForms((prev) => ({ ...prev, [activeSimpleResource.key]: next }))}
                onCreate={() => createResource(activeSimpleResource)}
                onDelete={(id: string) => deleteResource(activeSimpleResource.endpoint, id)}
                editingId={editingIds[activeSimpleResource.key]}
                setEditingId={(id: string | null) => setEditingIds((prev) => ({ ...prev, [activeSimpleResource.key]: id }))}
              />
            )}

            {active === 'announcements' && (
              <AdminPanel title="Announcements">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input value={announcementForm.title} placeholder="Title" onChange={(value) => setAnnouncementForm((prev) => ({ ...prev, title: value }))} />
                  <Input value={announcementForm.content} placeholder="Content" onChange={(value) => setAnnouncementForm((prev) => ({ ...prev, content: value }))} />
                  <Select value={announcementForm.targetDepartmentId} onChange={(value) => setAnnouncementForm((prev) => ({ ...prev, targetDepartmentId: value }))}>
                    <option value="">All departments</option>
                    {departments.map((item) => (
                      <option key={item.id} value={item.id}>{item.code || item.name}</option>
                    ))}
                  </Select>
                  <Select value={announcementForm.targetYearId} onChange={(value) => setAnnouncementForm((prev) => ({ ...prev, targetYearId: value }))}>
                    <option value="">All years</option>
                    {years.map((item) => (
                      <option key={item.id} value={item.id}>{item.yearName || item.level}</option>
                    ))}
                  </Select>
                </div>
                <ActionButton label={editingIds['announcements'] ? "Update announcement" : "Add announcement"} onClick={createAnnouncement} />
                <SimpleRows 
                  rows={data.announcements ?? []} 
                  columns={['title', 'content', 'targetDepartment', 'targetYear']} 
                  endpoint="/admin/announcements" 
                  reload={loadAll} 
                  onEdit={(row: any) => { setAnnouncementForm(flattenRow(row)); setEditingIds(prev => ({...prev, announcements: row.id})) }} 
                />
              </AdminPanel>
            )}

            {active === 'facultys' && (
              <AdminPanel title="Faculty Details">
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <Input value={forms.facultys?.name ?? ''} placeholder="Faculty name" onChange={(value) => setForms((prev) => ({ ...prev, facultys: { ...prev.facultys, name: value } }))} />
                  <Select value={forms.facultys?.departmentId ?? ''} onChange={(value) => setForms((prev) => ({ ...prev, facultys: { ...prev.facultys, departmentId: value } }))}>
                    <option value="">Department</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>{department.code || department.name}</option>
                    ))}
                  </Select>
                  <IconButton label={editingIds['facultys'] ? "Update faculty" : "Add faculty"} onClick={createFaculty} />
                </div>
                <SimpleRows 
                  rows={faculty} 
                  columns={['name', 'department']} 
                  endpoint="/admin/facultys" 
                  reload={loadAll}
                  onEdit={(row: any) => { setForms(prev => ({...prev, facultys: flattenRow(row)})); setEditingIds(prev => ({...prev, facultys: row.id})) }} 
                />
              </AdminPanel>
            )}

            {active === 'timetables' && (
              <AdminPanel title="Timetable Entry">
                <div className="grid gap-2 sm:grid-cols-3">
                  <Select value={timetableForm.departmentId} onChange={(value) => setTimetableForm((prev) => ({ ...prev, departmentId: value }))}>
                    <option value="">Department</option>
                    {departments.map((item) => <option key={item.id} value={item.id}>{item.code || item.name}</option>)}
                  </Select>
                  <Select value={timetableForm.yearId} onChange={(value) => setTimetableForm((prev) => ({ ...prev, yearId: value }))}>
                    <option value="">Year</option>
                    {years.map((item) => <option key={item.id} value={item.id}>{item.yearName || item.level}</option>)}
                  </Select>
                  <Select value={timetableForm.sectionId} onChange={(value) => setTimetableForm((prev) => ({ ...prev, sectionId: value }))}>
                    <option value="">Section</option>
                    {sections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </Select>
                  <Select value={timetableForm.dayOfWeek} onChange={(value) => setTimetableForm((prev) => ({ ...prev, dayOfWeek: value }))}>
                    {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map((day) => <option key={day} value={day}>{day}</option>)}
                  </Select>
                  <Input value={timetableForm.startTime} type="time" onChange={(value) => setTimetableForm((prev) => ({ ...prev, startTime: value }))} />
                  <Input value={timetableForm.endTime} type="time" onChange={(value) => setTimetableForm((prev) => ({ ...prev, endTime: value }))} />
                  <Select value={timetableForm.subjectId} onChange={(value) => setTimetableForm((prev) => ({ ...prev, subjectId: value }))}>
                    <option value="">Subject</option>
                    {subjects.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}
                  </Select>
                  <Select value={timetableForm.facultyId} onChange={(value) => setTimetableForm((prev) => ({ ...prev, facultyId: value }))}>
                    <option value="">Faculty</option>
                    {faculty.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </Select>
                  <Select value={timetableForm.classroomId} onChange={(value) => setTimetableForm((prev) => ({ ...prev, classroomId: value }))}>
                    <option value="">Classroom</option>
                    {classrooms.map((item) => <option key={item.id} value={item.id}>{item.roomNumber}</option>)}
                  </Select>
                </div>
                <ActionButton label={editingIds['timetables'] ? "Update timetable row" : "Add timetable row"} onClick={createTimetable} />
                <SimpleRows 
                  rows={timetable} 
                  columns={['dayOfWeek', 'subject', 'faculty', 'classroom']} 
                  endpoint="/admin/timetables" 
                  reload={loadAll}
                  onEdit={(row: any) => { setTimetableForm(flattenRow(row)); setEditingIds(prev => ({...prev, timetables: row.id})) }} 
                />
              </AdminPanel>
            )}

            {active === 'assessments' && (
              <AdminPanel title="Assessment Schedule">
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input value={assessmentForm.title} placeholder="Assessment title" onChange={(value) => setAssessmentForm((prev) => ({ ...prev, title: value }))} />
                  <Input value={assessmentForm.assessmentDate} type="date" onChange={(value) => setAssessmentForm((prev) => ({ ...prev, assessmentDate: value }))} />
                  <Input value={assessmentForm.maxMarks} placeholder="Max marks" onChange={(value) => setAssessmentForm((prev) => ({ ...prev, maxMarks: value }))} />
                  <RelationSelects form={assessmentForm} setForm={setAssessmentForm} departments={departments} years={years} sections={sections} subjects={subjects} />
                </div>
                <ActionButton label={editingIds['assessments'] ? "Update assessment" : "Add assessment"} onClick={createAssessment} />
                <SimpleRows 
                  rows={data.assessments ?? []} 
                  columns={['title', 'assessmentDate', 'subject', 'maxMarks']} 
                  endpoint="/admin/assessments" 
                  reload={loadAll}
                  onEdit={(row: any) => { setAssessmentForm(flattenRow(row)); setEditingIds(prev => ({...prev, assessments: row.id})) }} 
                />
              </AdminPanel>
            )}

            {active === 'exams' && (
              <AdminPanel title="Exam Schedule">
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input value={examForm.examName} placeholder="Exam name" onChange={(value) => setExamForm((prev) => ({ ...prev, examName: value }))} />
                  <Input value={examForm.examDate} type="date" onChange={(value) => setExamForm((prev) => ({ ...prev, examDate: value }))} />
                  <Input value={examForm.startTime} type="time" onChange={(value) => setExamForm((prev) => ({ ...prev, startTime: value }))} />
                  <Input value={examForm.endTime} type="time" onChange={(value) => setExamForm((prev) => ({ ...prev, endTime: value }))} />
                  <RelationSelects form={examForm} setForm={setExamForm} departments={departments} years={years} sections={sections} subjects={subjects} />
                  <Select value={examForm.classroomId} onChange={(value) => setExamForm((prev) => ({ ...prev, classroomId: value }))}>
                    <option value="">Classroom</option>
                    {classrooms.map((item) => <option key={item.id} value={item.id}>{item.roomNumber}</option>)}
                  </Select>
                </div>
                <ActionButton label={editingIds['exams'] ? "Update exam" : "Add exam"} onClick={createExam} />
                <SimpleRows 
                  rows={data.exams ?? []} 
                  columns={['examName', 'examDate', 'subject', 'classroom']} 
                  endpoint="/admin/exams" 
                  reload={loadAll}
                  onEdit={(row: any) => { setExamForm(flattenRow(row)); setEditingIds(prev => ({...prev, exams: row.id})) }} 
                />
              </AdminPanel>
            )}

            {active === 'attendance' && (
              <AdminPanel title="Attendance">
                <div className="grid gap-2 sm:grid-cols-4">
                  <Select value={attendanceForm.studentId} onChange={(value) => setAttendanceForm((prev) => ({ ...prev, studentId: value }))}>
                    <option value="">Student</option>
                    {students.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.registerNumber})</option>)}
                  </Select>
                  <Select value={attendanceForm.subjectId} onChange={(value) => setAttendanceForm((prev) => ({ ...prev, subjectId: value }))}>
                    <option value="">Subject</option>
                    {subjects.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}
                  </Select>
                  <Input value={attendanceForm.totalClasses} placeholder="Total classes" onChange={(value) => setAttendanceForm((prev) => ({ ...prev, totalClasses: value }))} />
                  <Input value={attendanceForm.attendedClasses} placeholder="Attended classes" onChange={(value) => setAttendanceForm((prev) => ({ ...prev, attendedClasses: value }))} />
                </div>
                <ActionButton label={editingIds['attendance'] ? "Update attendance" : "Add attendance"} onClick={createAttendance} />
                <SimpleRows 
                  rows={data.attendance ?? []} 
                  columns={['student', 'subject', 'attendedClasses', 'totalClasses']} 
                  endpoint="/admin/attendance" 
                  reload={loadAll}
                  onEdit={(row: any) => { setAttendanceForm(flattenRow(row)); setEditingIds(prev => ({...prev, attendance: row.id})) }} 
                />
              </AdminPanel>
            )}

            {active === 'internalMarks' && (
              <AdminPanel title="Internal Marks">
                <div className="grid gap-2 sm:grid-cols-3">
                  <Select value={internalMarkForm.studentId} onChange={(value) => setInternalMarkForm((prev) => ({ ...prev, studentId: value }))}>
                    <option value="">Student</option>
                    {students.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.registerNumber})</option>)}
                  </Select>
                  <Select value={internalMarkForm.subjectId} onChange={(value) => setInternalMarkForm((prev) => ({ ...prev, subjectId: value }))}>
                    <option value="">Subject</option>
                    {subjects.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}
                  </Select>
                  <Input value={internalMarkForm.assessmentName} placeholder="Assessment name" onChange={(value) => setInternalMarkForm((prev) => ({ ...prev, assessmentName: value }))} />
                  <Input value={internalMarkForm.marks} placeholder="Marks" onChange={(value) => setInternalMarkForm((prev) => ({ ...prev, marks: value }))} />
                  <Input value={internalMarkForm.maxMarks} placeholder="Max marks" onChange={(value) => setInternalMarkForm((prev) => ({ ...prev, maxMarks: value }))} />
                </div>
                <ActionButton label={editingIds['internalMarks'] ? "Update internal mark" : "Add internal mark"} onClick={createInternalMark} />
                <SimpleRows 
                  rows={data.internalMarks ?? []} 
                  columns={['student', 'subject', 'assessmentName', 'marks', 'maxMarks']} 
                  endpoint="/admin/internalMarks" 
                  reload={loadAll}
                  onEdit={(row: any) => { setInternalMarkForm(flattenRow(row)); setEditingIds(prev => ({...prev, internalMarks: row.id})) }} 
                />
              </AdminPanel>
            )}

            {active === 'students' && (
              <AdminPanel title="Student Accounts">
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input value={studentForm.username} placeholder="Username" autoComplete="new-password" onChange={(value) => setStudentForm((prev) => ({ ...prev, username: value }))} />
                  <Input value={studentForm.password} placeholder="Password" type="password" autoComplete="new-password" onChange={(value) => setStudentForm((prev) => ({ ...prev, password: value }))} />
                  <Input value={studentForm.registerNumber} placeholder="Register number" onChange={(value) => setStudentForm((prev) => ({ ...prev, registerNumber: value }))} />
                  <Input value={studentForm.name} placeholder="Full name" onChange={(value) => setStudentForm((prev) => ({ ...prev, name: value }))} />
                  <RelationSelects form={studentForm} setForm={setStudentForm} departments={departments} years={years} sections={sections} />
                </div>
                <ActionButton label={editingIds['students'] ? "Update student account" : "Create student account"} onClick={createStudent} />
                <SimpleRows 
                  rows={students} 
                  columns={['registerNumber', 'name', 'department', 'year', 'section']} 
                  onEdit={(row: any) => { setStudentForm(flattenRow(row)); setEditingIds(prev => ({...prev, students: row.id})) }}
                  onDelete={async (id: string) => { await api.delete(`/admin/students/${id}`); await loadAll(); }}
                />
              </AdminPanel>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function RelationSelects({
  form,
  setForm,
  departments,
  years,
  sections,
  subjects,
}: {
  form: Entity;
  setForm: (updater: (prev: any) => any) => void;
  departments: Entity[];
  years: Entity[];
  sections: Entity[];
  subjects?: Entity[];
}) {
  return (
    <>
      <Select value={form.departmentId ?? ''} onChange={(value) => setForm((prev: Entity) => ({ ...prev, departmentId: value }))}>
        <option value="">Department</option>
        {departments.map((item) => <option key={item.id} value={item.id}>{item.code || item.name}</option>)}
      </Select>
      <Select value={form.yearId ?? ''} onChange={(value) => setForm((prev: Entity) => ({ ...prev, yearId: value }))}>
        <option value="">Year</option>
        {years.map((item) => <option key={item.id} value={item.id}>{item.yearName || item.level}</option>)}
      </Select>
      <Select value={form.sectionId ?? ''} onChange={(value) => setForm((prev: Entity) => ({ ...prev, sectionId: value }))}>
        <option value="">Section</option>
        {sections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </Select>
      {subjects && (
        <Select value={form.subjectId ?? ''} onChange={(value) => setForm((prev: Entity) => ({ ...prev, subjectId: value }))}>
          <option value="">Subject</option>
          {subjects.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}
        </Select>
      )}
    </>
  );
}

function AdminPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-base font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function ResourcePanel({ resource, rows, form, setForm, onCreate, onDelete, editingId, setEditingId }: any) {
  const handleEdit = (row: any) => {
    setForm(row);
    setEditingId(row.id);
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold">Manage {resource.label}</h2>
        <div className="grid flex-1 gap-2 sm:max-w-3xl sm:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
          {resource.fields.map((field: string) => (
            <Input
              key={field}
              value={form[field] ?? ''}
              type={field.toLowerCase().includes('date') ? 'date' : 'text'}
              placeholder={labelFor(field)}
              onChange={(value: string) => setForm({ ...form, [field]: value })}
            />
          ))}
          <IconButton label={editingId ? `Update ${resource.label}` : `Add ${resource.label}`} onClick={onCreate} />
        </div>
      </div>
      <SimpleRows rows={rows} columns={resource.fields} onDelete={onDelete} onEdit={handleEdit} />
    </div>
  );
}

function SimpleRows({ rows, columns, onDelete, endpoint, reload, onEdit }: any) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows;
    const lower = searchQuery.toLowerCase();
    return rows.filter((row: Entity) => {
      return columns.some((col: string) => {
        const val = displayValue(row[col]);
        return String(val).toLowerCase().includes(lower);
      });
    });
  }, [rows, columns, searchQuery]);

  const deleteRow = async (id: string) => {
    if (onDelete) {
      await onDelete(id);
      return;
    }
    if (endpoint && reload) {
      await api.delete(`${endpoint}/${id}`);
      await reload();
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 w-full rounded-md border border-zinc-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-sky-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800">
            {columns.map((column: string) => (
              <th key={column} className="px-3 py-2 font-medium">{labelFor(column)}</th>
            ))}
            {(onDelete || endpoint || onEdit) && <th className="px-3 py-2 text-right font-medium">Action</th>}
          </tr>
          </thead>
          <tbody>
            {filteredRows.map((row: Entity) => (
              <tr key={row.id} className="border-b border-zinc-100 dark:border-zinc-800">
              {columns.map((column: string) => (
                <td key={column} className="px-3 py-2" title={String(displayValue(row[column]))}>
                  {displayValue(row[column])}
                </td>
              ))}
              {(onDelete || endpoint || onEdit) && (
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      title="Edit"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 mr-1"
                    >
                      <Pencil size={15} />
                    </button>
                  )}
                  {(onDelete || endpoint) && (
                    <button
                      onClick={() => deleteRow(row.id)}
                      title="Delete"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
          {filteredRows.length === 0 && (
            <tr>
              <td colSpan={columns.length + (onDelete || endpoint || onEdit ? 1 : 0)} className="px-3 py-8 text-center text-zinc-500">
                {rows.length === 0 ? 'No records yet.' : 'No matching results.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="mt-3 flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700">
      <Plus size={16} /> {label}
    </button>
  );
}
function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete = 'off',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      autoComplete={autoComplete}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 dark:border-zinc-700 dark:bg-zinc-950"
    />
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 dark:border-zinc-700 dark:bg-zinc-950"
    >
      {children}
    </select>
  );
}

function IconButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 text-white hover:bg-sky-700"
    >
      <Plus size={18} />
    </button>
  );
}

function normalizePayload(payload: Entity) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (key === 'level' || key === 'maxMarks') {
        return [key, Number(value)];
      }
      return [key, value];
    }),
  );
}

function displayValue(value: any) {
  if (value == null) return '-';
  if (typeof value === 'object') {
    return value.code || value.name || value.yearName || value.roomNumber || value.title || value.registerNumber || `#${value.id}`;
  }
  return String(value);
}

function labelFor(value: string) {
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}

function flattenRow(row: any) {
  const flat = { ...row };
  for (const [key, value] of Object.entries(row)) {
    if (value && typeof value === 'object' && 'id' in value) {
      flat[`${key}Id`] = (value as any).id;
    }
  }
  return flat;
}
