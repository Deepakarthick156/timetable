package com.college.assistant.controller;

import com.college.assistant.entity.InternalMark;
import com.college.assistant.repository.InternalMarkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/internalMarks")
@RequiredArgsConstructor
public class InternalMarkController {
    private final InternalMarkRepository repository;

    @GetMapping
    public List<InternalMark> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public InternalMark create(@RequestBody InternalMark entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InternalMark> update(@PathVariable String id, @RequestBody InternalMark entity) {
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
