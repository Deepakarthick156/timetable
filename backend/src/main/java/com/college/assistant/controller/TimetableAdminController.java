package com.college.assistant.controller;

import com.college.assistant.entity.Timetable;
import com.college.assistant.repository.TimetableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/timetables")
@RequiredArgsConstructor
public class TimetableAdminController {

    private final TimetableRepository repository;

    @GetMapping
    public org.springframework.data.domain.Page<Timetable> getAll(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "0") int page,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "20") int size) {
        return repository.findAll(org.springframework.data.domain.PageRequest.of(page, size));
    }

    @PostMapping
    public Timetable create(@RequestBody Timetable entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Timetable> update(@PathVariable String id, @RequestBody Timetable entity) {
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
