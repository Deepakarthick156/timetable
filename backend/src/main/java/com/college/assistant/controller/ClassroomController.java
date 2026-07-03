package com.college.assistant.controller;

import com.college.assistant.entity.Classroom;
import com.college.assistant.repository.ClassroomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/classrooms")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassroomRepository repository;

    @GetMapping
    public List<Classroom> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Classroom create(@RequestBody Classroom entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Classroom> update(@PathVariable String id, @RequestBody Classroom entityDetails) {
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
