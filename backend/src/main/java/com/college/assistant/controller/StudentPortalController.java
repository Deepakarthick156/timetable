package com.college.assistant.controller;

import com.college.assistant.entity.Student;
import com.college.assistant.entity.Timetable;
import com.college.assistant.entity.User;
import com.college.assistant.repository.AnnouncementRepository;
import com.college.assistant.repository.AssessmentRepository;
import com.college.assistant.repository.AttendanceRepository;
import com.college.assistant.repository.ExamScheduleRepository;
import com.college.assistant.repository.HolidayRepository;
import com.college.assistant.repository.InternalMarkRepository;
import com.college.assistant.repository.StudentRepository;
import com.college.assistant.repository.UserRepository;
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

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getMyProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> userOpt = userRepository.findByUsername(auth.getName());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        return studentRepository.findByUser_Id(userOpt.get().getId())
                .map(student -> {
                    Map<String, Object> profile = new LinkedHashMap<>();
                    profile.put("registerNumber", student.getRegisterNumber());
                    profile.put("name", student.getName());
                    profile.put("department", student.getDepartment());
                    profile.put("year", student.getYear());
                    profile.put("section", student.getSection());
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
                .filter(announcement -> announcement.getTargetDepartment() == null || announcement.getTargetDepartment().getId().equals(student.getDepartment().getId()))
                .filter(announcement -> announcement.getTargetYear() == null || announcement.getTargetYear().getId().equals(student.getYear().getId()))
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
        return ResponseEntity.ok(assessmentRepository.findByDepartment_IdAndYear_IdAndSection_Id(
                student.getDepartment().getId(),
                student.getYear().getId(),
                student.getSection().getId()
        ));
    }

    @GetMapping("/attendance")
    public ResponseEntity<?> getAttendance() {
        Optional<Student> studentOpt = currentStudent();
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(attendanceRepository.findByStudent_Id(studentOpt.get().getId()));
    }

    @GetMapping("/internal-marks")
    public ResponseEntity<?> getInternalMarks() {
        Optional<Student> studentOpt = currentStudent();
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(internalMarkRepository.findByStudent_Id(studentOpt.get().getId()));
    }

    @GetMapping("/exams")
    public ResponseEntity<?> getExams() {
        Optional<Student> studentOpt = currentStudent();
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        Student student = studentOpt.get();
        return ResponseEntity.ok(examScheduleRepository.findByDepartment_IdAndYear_IdAndSection_Id(
                student.getDepartment().getId(),
                student.getYear().getId(),
                student.getSection().getId()
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
        Optional<Student> studentOpt = currentStudent();
        
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            StringBuilder contextBuilder = new StringBuilder();
            
            List<Timetable> timetable = timetableService.getTimetableForStudent(student.getUser().getId());
            contextBuilder.append("Timetable:\n");
            timetable.forEach(t -> contextBuilder.append(String.format("- %s %s-%s: %s (Faculty: %s, Room: %s)\n", 
                    t.getDayOfWeek(), t.getStartTime(), t.getEndTime(), 
                    t.getSubject() != null ? t.getSubject().getName() : "", 
                    t.getFaculty() != null ? t.getFaculty().getName() : "", 
                    t.getClassroom() != null ? t.getClassroom().getRoomNumber() : "")));
            
            contextBuilder.append("\nAnnouncements:\n");
            announcementRepository.findAll().stream()
                .filter(a -> a.getTargetDepartment() == null || a.getTargetDepartment().getId().equals(student.getDepartment().getId()))
                .filter(a -> a.getTargetYear() == null || a.getTargetYear().getId().equals(student.getYear().getId()))
                .forEach(a -> contextBuilder.append(String.format("- %s: %s (Created: %s)\n", a.getTitle(), a.getContent(), a.getCreatedAt())));
                
            contextBuilder.append("\nHolidays:\n");
            holidayRepository.findAll().forEach(h -> contextBuilder.append(String.format("- %s (%s) on %s\n", h.getName(), h.getType(), h.getHolidayDate())));
            
            java.util.Set<String> classDays = timetable.stream()
                .map(t -> t.getDayOfWeek().toUpperCase())
                .collect(java.util.stream.Collectors.toSet());
                
            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.LocalDate endOfMonth = java.time.YearMonth.from(today).atEndOfMonth();
            
            for (java.time.LocalDate date = today; !date.isAfter(endOfMonth); date = date.plusDays(1)) {
                String dayName = date.getDayOfWeek().name();
                if (!classDays.contains(dayName)) {
                    contextBuilder.append(String.format("- Weekend/No Class Holiday on %s (%s)\n", date, dayName));
                }
            }
            
            contextBuilder.append("\nExams:\n");
            examScheduleRepository.findByDepartment_IdAndYear_IdAndSection_Id(student.getDepartment().getId(), student.getYear().getId(), student.getSection().getId())
                .forEach(e -> contextBuilder.append(String.format("- %s for %s on %s from %s to %s\n", e.getExamName(), e.getSubject() != null ? e.getSubject().getName() : "", e.getExamDate(), e.getStartTime(), e.getEndTime())));
                
            String response = aiService.askQuestion(question, contextBuilder.toString());
            return ResponseEntity.ok(Map.of("response", response));
        }
        return ResponseEntity.status(401).build();
    }

    private Optional<Student> currentStudent() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName())
                .flatMap(user -> studentRepository.findByUser_Id(user.getId()));
    }
}
