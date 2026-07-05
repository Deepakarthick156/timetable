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
    private final com.college.assistant.repository.UserRepository userRepository;

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
        existingStudent.setDepartmentId(cleanId(student.getDepartmentId()));
        existingStudent.setYearId(cleanId(student.getYearId()));
        existingStudent.setSectionId(cleanId(student.getSectionId()));
        
        return studentRepository.save(existingStudent);
    }
    
    private String cleanId(String id) {
        return (id != null && id.trim().isEmpty()) ? null : id;
    }
    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<Void> delete(@org.springframework.web.bind.annotation.PathVariable String id) {
        Student student = studentRepository.findById(id).orElse(null);
        if (student != null) {
            studentRepository.deleteById(id);
            if (student.getUserId() != null) {
                userRepository.deleteById(student.getUserId());
            }
        }
        return org.springframework.http.ResponseEntity.ok().build();
    }
}
