package com.college.assistant.controller;

import com.college.assistant.entity.Attendance;
import com.college.assistant.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceRepository repository;

    @GetMapping
    public List<Attendance> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Attendance create(@RequestBody Attendance entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Attendance> update(@PathVariable String id, @RequestBody Attendance entity) {
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
