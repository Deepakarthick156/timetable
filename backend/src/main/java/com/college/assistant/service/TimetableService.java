package com.college.assistant.service;

import com.college.assistant.entity.Student;
import com.college.assistant.entity.Timetable;
import com.college.assistant.repository.StudentRepository;
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

    public List<Timetable> getTimetableForStudent(String userId) {
        Optional<Student> studentOpt = studentRepository.findByUser_Id(userId);
        if (studentOpt.isEmpty()) {
            return List.of();
        }
        Student student = studentOpt.get();
        return timetableRepository.findByDepartment_IdAndYear_IdAndSection_Id(
                student.getDepartment().getId(),
                student.getYear().getId(),
                student.getSection().getId()
        );
    }
}