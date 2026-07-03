package com.college.assistant.controller;

import com.college.assistant.entity.AcademicYear;
import com.college.assistant.repository.AcademicYearRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/academicYears")
@RequiredArgsConstructor
public class AcademicYearController {

    private final AcademicYearRepository repository;

    @GetMapping
    public List<AcademicYear> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public AcademicYear create(@RequestBody AcademicYear entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AcademicYear> update(@PathVariable String id, @RequestBody AcademicYear entityDetails) {
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
