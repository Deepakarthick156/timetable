package com.college.assistant.controller;

import com.college.assistant.entity.Section;
import com.college.assistant.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/sections")
@RequiredArgsConstructor
public class SectionController {

    private final SectionRepository repository;

    @GetMapping
    public List<Section> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Section create(@RequestBody Section entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Section> update(@PathVariable String id, @RequestBody Section entityDetails) {
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
