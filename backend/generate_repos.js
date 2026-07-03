const fs = require('fs');
const path = require('path');

const repoPath = path.join(__dirname, 'src', 'main', 'java', 'com', 'college', 'assistant', 'repository');

if (!fs.existsSync(repoPath)) {
    fs.mkdirSync(repoPath, { recursive: true });
}

const entities = ['User', 'Department', 'AcademicYear', 'Section', 'Student', 'Subject', 'Faculty', 'Classroom', 'Timetable', 'Announcement'];

entities.forEach(entity => {
    const content = `package com.college.assistant.repository;

import com.college.assistant.entity.${entity};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ${entity}Repository extends JpaRepository<${entity}, Long> {
}
`;
    fs.writeFileSync(path.join(repoPath, `${entity}Repository.java`), content);
    console.log(`Created ${entity}Repository.java`);
});

// Add specific methods to UserRepository and StudentRepository
fs.writeFileSync(path.join(repoPath, 'UserRepository.java'), `package com.college.assistant.repository;

import com.college.assistant.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
`);

fs.writeFileSync(path.join(repoPath, 'StudentRepository.java'), `package com.college.assistant.repository;

import com.college.assistant.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
}
`);

// Add specific methods to TimetableRepository
fs.writeFileSync(path.join(repoPath, 'TimetableRepository.java'), `package com.college.assistant.repository;

import com.college.assistant.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findByDepartmentIdAndYearIdAndSectionId(Long departmentId, Long yearId, Long sectionId);
}
`);
