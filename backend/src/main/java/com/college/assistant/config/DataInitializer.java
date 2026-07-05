package com.college.assistant.config;

import com.college.assistant.entity.*;
import com.college.assistant.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final AcademicYearRepository yearRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final FacultyRepository facultyRepository;
    private final ClassroomRepository classroomRepository;
    private final TimetableRepository timetableRepository;
    private final AnnouncementRepository announcementRepository;
    private final MongoTemplate mongoTemplate;
    private final HolidayRepository holidayRepository;
    private final AssessmentRepository assessmentRepository;
    private final ExamScheduleRepository examScheduleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (departmentRepository.count() > 0) {
            return;
        }

        // Admin User
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        // Departments
        String[][] depts = {
                {"Computer Science", "CSE"}, {"AI & DS", "AIDS"}, {"Information Technology", "IT"},
                {"Electronics & Communication", "ECE"}, {"Electrical & Electronics", "EEE"},
                {"Mechanical Engineering", "MECH"}, {"Civil Engineering", "CIVIL"},
                {"Master of Business Administration", "MBA"}, {"Master of Computer Applications", "MCA"}
        };
        List<Department> departments = new ArrayList<>();
        for (String[] d : depts) {
            departments.add(saveDepartment(d[0], d[1]));
        }

        // Years
        String[] yearNames = {"First Year", "Second Year", "Third Year", "Fourth Year"};
        List<AcademicYear> years = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            years.add(saveYear(yearNames[i], i + 1));
        }

        // Sections
        String[] secNames = {"A", "B", "C", "D"};
        List<Section> sections = new ArrayList<>();
        for (String s : secNames) {
            sections.add(saveSection(s));
        }

        // Classrooms
        List<Classroom> classrooms = new ArrayList<>();
        for (int i = 1; i <= 20; i++) {
            classrooms.add(saveClassroom("Room " + (100 + i), "CLASS"));
            classrooms.add(saveClassroom("Lab " + i, "LAB"));
        }

        // For each department
        for (Department dept : departments) {
            // Generate Faculty
            String[] fNames = {"Dr. Ramesh Kumar", "Prof. Priya Sharma", "Dr. Rajesh Iyer", "Prof. Kavitha S", "Dr. Arun Nair", "Prof. Meena K", "Dr. Suresh Babu", "Prof. Anjali D", "Dr. Vikram Singh", "Prof. Sneha R"};
            List<Faculty> deptFaculty = new ArrayList<>();
            for (int i = 0; i < 10; i++) {
                deptFaculty.add(saveFaculty(fNames[i], dept));
            }

            // For each year
            for (AcademicYear year : years) {
                // Generate Subjects
                String[] coreSubjects = {"Data Structures", "Operating Systems", "Computer Networks", "Database Management", "Software Engineering", "Artificial Intelligence", "Machine Learning", "Cloud Computing", "Cyber Security", "Internet of Things"};
                List<Subject> subjects = new ArrayList<>();
                for (int i = 0; i < 5; i++) {
                    String subName = coreSubjects[(year.getLevel() * 2 + i) % coreSubjects.length];
                    subjects.add(saveSubject(subName + " (" + dept.getCode() + ")", dept.getCode() + year.getLevel() + "0" + i, "THEORY"));
                }
                subjects.add(saveSubject(dept.getCode() + " Practical Lab", dept.getCode() + year.getLevel() + "L", "LAB"));

                // For each section
                for (Section sec : sections) {
                    // Create Exams for each subject
                    for (Subject sub : subjects) {
                        Assessment ia = new Assessment();
                        ia.setTitle("Internal Assessment - " + sub.getName());
                        ia.setAssessmentDate(LocalDate.now().plusDays(15));
                        ia.setMaxMarks(50);
                        ia.setDepartmentId(dept.getId());
                        ia.setYearId(year.getId());
                        ia.setSectionId(sec.getId());
                        ia.setSubjectId(sub.getId());
                        assessmentRepository.save(ia);

                        ExamSchedule endSem = new ExamSchedule();
                        endSem.setExamName("End Sem - " + sub.getName());
                        endSem.setExamDate(LocalDate.now().plusDays(40));
                        endSem.setStartTime(LocalTime.of(10, 0));
                        endSem.setEndTime(LocalTime.of(13, 0));
                        endSem.setDepartmentId(dept.getId());
                        endSem.setYearId(year.getId());
                        endSem.setSectionId(sec.getId());
                        endSem.setSubjectId(sub.getId());
                        endSem.setClassroomId(classrooms.get(0).getId()); // Generic classroom
                        examScheduleRepository.save(endSem);
                    }

                    // Create Timetable (Mon - Fri)
                    DayOfWeek[] days = {DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY};
                    String[][] times = {
                            {"09:00", "10:00"}, {"10:00", "11:00"}, {"11:15", "12:15"}, {"13:00", "14:00"}, {"14:00", "15:00"}, {"15:15", "16:15"}
                    };
                    for (DayOfWeek day : days) {
                        for (int i = 0; i < times.length; i++) {
                            Subject s = subjects.get(i % subjects.size());
                            Faculty f = deptFaculty.get(i % deptFaculty.size());
                            Classroom c = (s.getType().equals("LAB")) ? classrooms.get(1) : classrooms.get(0);
                            
                            Timetable entry = new Timetable();
                            entry.setDepartmentId(dept.getId());
                            entry.setYearId(year.getId());
                            entry.setSectionId(sec.getId());
                            entry.setDayOfWeek(day.name());
                            entry.setStartTime(LocalTime.parse(times[i][0]));
                            entry.setEndTime(LocalTime.parse(times[i][1]));
                            entry.setSubjectId(s.getId());
                            entry.setFacultyId(f.getId());
                            entry.setClassroomId(c.getId());
                            timetableRepository.save(entry);
                        }
                    }
                }
            }
        }

        Announcement global = new Announcement();
        global.setTitle("Semester Starts");
        global.setContent("Welcome to the new semester.");
        global.setCreatedAt(LocalDateTime.now().minusDays(2));
        announcementRepository.save(global);

        saveHoliday("Independence Day", LocalDate.of(2026, 8, 15), "NATIONAL");
        saveHoliday("Diwali", LocalDate.of(2026, 11, 4), "FESTIVAL");
    }

    private Department saveDepartment(String name, String code) {
        Department department = new Department();
        department.setName(name);
        department.setCode(code);
        return departmentRepository.save(department);
    }

    private AcademicYear saveYear(String yearName, int level) {
        AcademicYear year = new AcademicYear();
        year.setYearName(yearName);
        year.setLevel(level);
        return yearRepository.save(year);
    }

    private Section saveSection(String name) {
        Section section = new Section();
        section.setName(name);
        return sectionRepository.save(section);
    }

    private Subject saveSubject(String name, String code, String type) {
        Subject subject = new Subject();
        subject.setName(name);
        subject.setCode(code);
        subject.setType(type);
        return subjectRepository.save(subject);
    }

    private Faculty saveFaculty(String name, Department department) {
        Faculty faculty = new Faculty();
        faculty.setName(name);
        faculty.setDepartmentId(department.getId());
        return facultyRepository.save(faculty);
    }

    private Classroom saveClassroom(String roomNumber, String type) {
        Classroom classroom = new Classroom();
        classroom.setRoomNumber(roomNumber);
        classroom.setType(type);
        return classroomRepository.save(classroom);
    }

    private void saveHoliday(String name, LocalDate date, String type) {
        Holiday holiday = new Holiday();
        holiday.setName(name);
        holiday.setHolidayDate(date);
        holiday.setType(type);
        holidayRepository.save(holiday);
    }
}
