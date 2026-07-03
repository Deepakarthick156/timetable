package com.college.assistant.controller;

import com.college.assistant.entity.Department;
import com.college.assistant.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentRepository repository;

    @GetMapping
    public List<Department> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Department create(@RequestBody Department entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Department> update(@PathVariable String id, @RequestBody Department entityDetails) {
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
