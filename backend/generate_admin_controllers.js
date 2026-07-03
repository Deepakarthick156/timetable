const fs = require('fs');
const path = require('path');

const controllerPath = path.join(__dirname, 'src', 'main', 'java', 'com', 'college', 'assistant', 'controller');

const entities = ['Department', 'AcademicYear', 'Section', 'Subject', 'Faculty', 'Classroom', 'Announcement'];

entities.forEach(entity => {
    const varName = entity.charAt(0).toLowerCase() + entity.slice(1);
    const content = `package com.college.assistant.controller;

import com.college.assistant.entity.${entity};
import com.college.assistant.repository.${entity}Repository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/${varName}s")
@RequiredArgsConstructor
public class ${entity}Controller {

    private final ${entity}Repository repository;

    @GetMapping
    public List<${entity}> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public ${entity} create(@RequestBody ${entity} entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<${entity}> update(@PathVariable Long id, @RequestBody ${entity} entityDetails) {
        return repository.findById(id)
                .map(existing -> {
                    // Quick property copy could be done here, for now just setting ID
                    entityDetails.setId(id);
                    return ResponseEntity.ok(repository.save(entityDetails));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
`;
    fs.writeFileSync(path.join(controllerPath, `${entity}Controller.java`), content);
    console.log(`Created ${entity}Controller.java`);
});

// Timetable Controller (Admin)
const timetableController = `package com.college.assistant.controller;

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
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
`;
fs.writeFileSync(path.join(controllerPath, `TimetableAdminController.java`), timetableController);
console.log('Created TimetableAdminController.java');
