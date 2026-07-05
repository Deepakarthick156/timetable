package com.college.assistant.controller;

import com.college.assistant.entity.Student;
import com.college.assistant.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/students")
@RequiredArgsConstructor
public class StudentAdminController {
    private final StudentRepository studentRepository;

    @GetMapping
    public List<Student> getAll() {
        return studentRepository.findAll();
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    public Student update(@org.springframework.web.bind.annotation.PathVariable String id, @org.springframework.web.bind.annotation.RequestBody Student student) {
        studentRepository.findByRegisterNumber(student.getRegisterNumber()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Register number already exists");
            }
        });
        
        Student existingStudent = studentRepository.findById(id)
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Student not found"));
            
        existingStudent.setRegisterNumber(student.getRegisterNumber());
        existingStudent.setName(student.getName());
        existingStudent.setDepartmentId(student.getDepartmentId());
        existingStudent.setYearId(student.getYearId());
        existingStudent.setSectionId(student.getSectionId());
        
        return studentRepository.save(existingStudent);
    }
}
