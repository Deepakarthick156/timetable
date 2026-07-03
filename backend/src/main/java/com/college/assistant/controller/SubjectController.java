package com.college.assistant.controller;

import com.college.assistant.entity.Subject;
import com.college.assistant.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectRepository repository;

    @GetMapping
    public List<Subject> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Subject create(@RequestBody Subject entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subject> update(@PathVariable String id, @RequestBody Subject entityDetails) {
        return repository.findById(id)
                .map(existing -> {
                    // Quick property copy could be done here, for now just setting ID
                    entityDetails.setId(id);
                    return ResponseEntity.ok(repository.save(entityDetails));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
