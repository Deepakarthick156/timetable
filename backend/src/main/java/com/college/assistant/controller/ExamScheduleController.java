package com.college.assistant.controller;

import com.college.assistant.entity.ExamSchedule;
import com.college.assistant.repository.ExamScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/exams")
@RequiredArgsConstructor
public class ExamScheduleController {
    private final ExamScheduleRepository repository;

    @GetMapping
    public List<ExamSchedule> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public ExamSchedule create(@RequestBody ExamSchedule entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExamSchedule> update(@PathVariable String id, @RequestBody ExamSchedule entity) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        entity.setId(id);
        return ResponseEntity.ok(repository.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
