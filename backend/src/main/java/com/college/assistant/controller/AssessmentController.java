package com.college.assistant.controller;

import com.college.assistant.entity.Assessment;
import com.college.assistant.repository.AssessmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/assessments")
@RequiredArgsConstructor
public class AssessmentController {
    private final AssessmentRepository repository;

    @GetMapping
    public List<Assessment> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Assessment create(@RequestBody Assessment entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Assessment> update(@PathVariable String id, @RequestBody Assessment entity) {
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
