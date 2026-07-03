package com.college.assistant.controller;

import com.college.assistant.entity.Announcement;
import com.college.assistant.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementRepository repository;

    @GetMapping
    public List<Announcement> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Announcement create(@RequestBody Announcement entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Announcement> update(@PathVariable String id, @RequestBody Announcement entityDetails) {
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
