package com.college.assistant.controller;

import com.college.assistant.entity.Holiday;
import com.college.assistant.repository.HolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/holidays")
@RequiredArgsConstructor
public class HolidayController {
    private final HolidayRepository repository;

    @GetMapping
    public List<Holiday> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Holiday create(@RequestBody Holiday entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Holiday> update(@PathVariable String id, @RequestBody Holiday entity) {
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
