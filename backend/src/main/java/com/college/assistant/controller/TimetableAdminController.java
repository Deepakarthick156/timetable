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
    public List<Timetable> getAll() {
        return repository.findAll();
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
