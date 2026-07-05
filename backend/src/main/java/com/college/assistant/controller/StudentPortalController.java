package com.college.assistant.controller;

import com.college.assistant.entity.Student;
import com.college.assistant.entity.Timetable;
import com.college.assistant.entity.User;
import com.college.assistant.entity.Subject;
import com.college.assistant.entity.Faculty;
import com.college.assistant.entity.Classroom;
import com.college.assistant.entity.Announcement;
import com.college.assistant.entity.Holiday;
import com.college.assistant.entity.ExamSchedule;
import com.college.assistant.repository.AnnouncementRepository;
import com.college.assistant.repository.AssessmentRepository;
import com.college.assistant.repository.AttendanceRepository;
import com.college.assistant.repository.ExamScheduleRepository;
import com.college.assistant.repository.HolidayRepository;
import com.college.assistant.repository.InternalMarkRepository;
import com.college.assistant.repository.StudentRepository;
import com.college.assistant.repository.UserRepository;
import com.college.assistant.repository.SubjectRepository;
import com.college.assistant.repository.FacultyRepository;
import com.college.assistant.repository.ClassroomRepository;
import com.college.assistant.repository.*;
import com.college.assistant.service.AiService;
import com.college.assistant.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentPortalController {

    private final TimetableService timetableService;
    private final AiService aiService;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final AnnouncementRepository announcementRepository;
    private final HolidayRepository holidayRepository;
    private final AssessmentRepository assessmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final InternalMarkRepository internalMarkRepository;
    private final ExamScheduleRepository examScheduleRepository;
    private final SubjectRepository subjectRepository;
    private final FacultyRepository facultyRepository;
    private final ClassroomRepository classroomRepository;
    private final DepartmentRepository departmentRepository;
    private final AcademicYearRepository yearRepository;
    private final SectionRepository sectionRepository;

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getMyProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> userOpt = userRepository.findByUsername(auth.getName());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        return studentRepository.findByUserId(userOpt.get().getId())
                .map(student -> {
                    Map<String, Object> profile = new LinkedHashMap<>();
                    profile.put("registerNumber", student.getRegisterNumber());
                    profile.put("name", student.getName());
                    
                    if (student.getDepartmentId() != null) {
                        departmentRepository.findById(student.getDepartmentId()).ifPresent(dept -> profile.put("department", dept));
                    }
                    if (student.getYearId() != null) {
                        yearRepository.findById(student.getYearId()).ifPresent(year -> profile.put("year", year));
                    }
                    if (student.getSectionId() != null) {
                        sectionRepository.findById(student.getSectionId()).ifPresent(sec -> profile.put("section", sec));
                    }
                    
                    return ResponseEntity.ok(profile);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/announcements")
    public ResponseEntity<?> getAnnouncements() {
        Optional<Student> studentOpt = currentStudent();
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        Student student = studentOpt.get();
        return ResponseEntity.ok(announcementRepository.findAll().stream()
                .filter(announcement -> announcement.getTargetDepartmentId() == null || announcement.getTargetDepartmentId().equals(student.getDepartmentId()))
                .filter(announcement -> announcement.getTargetYearId() == null || announcement.getTargetYearId().equals(student.getYearId()))
                .toList());
    }

    @GetMapping("/holidays")
    public ResponseEntity<?> getHolidays() {
        return ResponseEntity.ok(holidayRepository.findAll());
    }

    @GetMapping("/assessments")
    public ResponseEntity<?> getAssessments() {
        Optional<Student> studentOpt = currentStudent();
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        Student student = studentOpt.get();
        return ResponseEntity.ok(assessmentRepository.findByDepartmentIdAndYearIdAndSectionId(
                student.getDepartmentId(),
                student.getYearId(),
                student.getSectionId()
        ));
    }

    @GetMapping("/attendance")
    public ResponseEntity<?> getAttendance() {
        Optional<Student> studentOpt = currentStudent();
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(attendanceRepository.findByStudentId(studentOpt.get().getId()));
    }

    @GetMapping("/internal-marks")
    public ResponseEntity<?> getInternalMarks() {
        Optional<Student> studentOpt = currentStudent();
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(internalMarkRepository.findByStudentId(studentOpt.get().getId()));
    }

    @GetMapping("/exams")
    public ResponseEntity<?> getExams() {
        Optional<Student> studentOpt = currentStudent();
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        Student student = studentOpt.get();
        return ResponseEntity.ok(examScheduleRepository.findByDepartmentIdAndYearIdAndSectionId(
                student.getDepartmentId(),
                student.getYearId(),
                student.getSectionId()
        ));
    }

    @GetMapping("/timetable")
    public ResponseEntity<List<Timetable>> getMyTimetable() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> userOpt = userRepository.findByUsername(auth.getName());
        
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(timetableService.getTimetableForStudent(userOpt.get().getId()));
        }
        return ResponseEntity.status(401).build();
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chatWithAi(@RequestBody Map<String, String> request) {
        String question = request.get("question");
        String history = request.get("history");
        Optional<Student> studentOpt = currentStudent();
        
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            StringBuilder contextBuilder = new StringBuilder();
            
            if (history != null && !history.isBlank()) {
                contextBuilder.append("Recent Conversation History:\n").append(history).append("\n\n");
            }
            
            java.time.LocalDate today = java.time.LocalDate.now();
            
            try {
                List<Timetable> timetable = timetableService.getTimetableForStudent(student.getUserId());
                contextBuilder.append("Timetable:\n");
                timetable.forEach(t -> {
                    String subjectName = t.getSubject() != null ? t.getSubject().getName() : "";
                    if (subjectName.toLowerCase().contains("lab") || subjectName.toLowerCase().contains("practical")) {
                        subjectName = "[LAB] " + subjectName;
                    }
                    contextBuilder.append(String.format("%s %s-%s: %s (F:%s R:%s)\n", 
                        t.getDayOfWeek(), t.getStartTime(), t.getEndTime(), 
                        subjectName, 
                        t.getFaculty() != null ? t.getFaculty().getName() : "", 
                        t.getClassroom() != null ? t.getClassroom().getRoomNumber() : ""));
                });
                
                contextBuilder.append("\nAnnouncements:\n");
                announcementRepository.findRelevant(student.getDepartmentId(), student.getYearId())
                    .forEach(a -> contextBuilder.append(String.format("- %s\n", a.getTitle())));
                    
                contextBuilder.append("\nHolidays:\n");
                holidayRepository.findUpcoming(today)
                    .forEach(h -> contextBuilder.append(String.format("- %s on %s\n", h.getName(), h.getHolidayDate())));
                
                contextBuilder.append("\nExams:\n");
                examScheduleRepository.findByDepartmentIdAndYearIdAndSectionId(student.getDepartmentId(), student.getYearId(), student.getSectionId())
                    .forEach(e -> {
                        String subName = "";
                        if (e.getSubjectId() != null) {
                            subName = subjectRepository.findById(e.getSubjectId()).map(Subject::getName).orElse("");
                        }
                        contextBuilder.append(String.format("- %s:%s on %s\n", e.getExamName(), subName, e.getExamDate()));
                    });
            } catch (Exception e) {
                e.printStackTrace();
            }
                
            String response = aiService.askQuestion(question, contextBuilder.toString());
            return ResponseEntity.ok(Map.of("response", response));
        }
        return ResponseEntity.status(401).build();
    }

    private Optional<Student> currentStudent() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName())
                .flatMap(user -> studentRepository.findByUserId(user.getId()));
    }
}
