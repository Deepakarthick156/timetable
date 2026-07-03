package com.college.assistant.controller;

import com.college.assistant.entity.Faculty;
import com.college.assistant.repository.FacultyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/facultys")
@RequiredArgsConstructor
public class FacultyController {

    private final FacultyRepository repository;

    @GetMapping
    public List<Faculty> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Faculty create(@RequestBody Faculty entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Faculty> update(@PathVariable String id, @RequestBody Faculty entityDetails) {
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
