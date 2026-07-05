package com.college.assistant.service;

import com.college.assistant.entity.Student;
import com.college.assistant.entity.Timetable;
import com.college.assistant.repository.ClassroomRepository;
import com.college.assistant.repository.FacultyRepository;
import com.college.assistant.repository.StudentRepository;
import com.college.assistant.repository.SubjectRepository;
import com.college.assistant.repository.TimetableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TimetableService {
    private final TimetableRepository timetableRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final FacultyRepository facultyRepository;
    private final ClassroomRepository classroomRepository;

    public List<Timetable> getTimetableForStudent(String userId) {
        Optional<Student> studentOpt = studentRepository.findByUserId(userId);
        if (studentOpt.isEmpty()) {
            return List.of();
        }
        Student student = studentOpt.get();
        List<Timetable> timetables = timetableRepository.findByDepartmentIdAndYearIdAndSectionId(
                student.getDepartmentId(),
                student.getYearId(),
                student.getSectionId()
        );
        java.util.Set<String> subjectIds = timetables.stream().map(Timetable::getSubjectId).filter(id -> id != null).collect(java.util.stream.Collectors.toSet());
        java.util.Set<String> facultyIds = timetables.stream().map(Timetable::getFacultyId).filter(id -> id != null).collect(java.util.stream.Collectors.toSet());
        java.util.Set<String> classroomIds = timetables.stream().map(Timetable::getClassroomId).filter(id -> id != null).collect(java.util.stream.Collectors.toSet());

        java.util.Map<String, com.college.assistant.entity.Subject> subjectMap = new java.util.HashMap<>();
        if (!subjectIds.isEmpty()) subjectRepository.findAllById(subjectIds).forEach(s -> subjectMap.put(s.getId(), s));
        
        java.util.Map<String, com.college.assistant.entity.Faculty> facultyMap = new java.util.HashMap<>();
        if (!facultyIds.isEmpty()) facultyRepository.findAllById(facultyIds).forEach(f -> facultyMap.put(f.getId(), f));
        
        java.util.Map<String, com.college.assistant.entity.Classroom> classroomMap = new java.util.HashMap<>();
        if (!classroomIds.isEmpty()) classroomRepository.findAllById(classroomIds).forEach(c -> classroomMap.put(c.getId(), c));

        for (Timetable t : timetables) {
            if (t.getSubjectId() != null) t.setSubject(subjectMap.get(t.getSubjectId()));
            if (t.getFacultyId() != null) t.setFaculty(facultyMap.get(t.getFacultyId()));
            if (t.getClassroomId() != null) t.setClassroom(classroomMap.get(t.getClassroomId()));
        }
        
        return timetables;
    }
}