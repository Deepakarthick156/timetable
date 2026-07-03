const fs = require('fs');
const path = require('path');

const entityPath = path.join(__dirname, 'src', 'main', 'java', 'com', 'college', 'assistant', 'entity');

const entities = {
    'Department': `package com.college.assistant.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String code;
}`,
    'AcademicYear': `package com.college.assistant.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class AcademicYear {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String yearName;
    private Integer level;
}`,
    'Section': `package com.college.assistant.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Section {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
}`,
    'Student': `package com.college.assistant.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String registerNumber;
    private String name;
    
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
    
    @ManyToOne
    @JoinColumn(name = "year_id")
    private AcademicYear year;
    
    @ManyToOne
    @JoinColumn(name = "section_id")
    private Section section;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}`,
    'Subject': `package com.college.assistant.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String code;
    private String type; // e.g., THEORY, LAB
}`,
    'Faculty': `package com.college.assistant.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Faculty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
}`,
    'Classroom': `package com.college.assistant.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Classroom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String roomNumber;
    private String type; // e.g., CLASS, LAB
}`,
    'Timetable': `package com.college.assistant.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;

@Entity
@Data
public class Timetable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
    
    @ManyToOne
    @JoinColumn(name = "year_id")
    private AcademicYear year;
    
    @ManyToOne
    @JoinColumn(name = "section_id")
    private Section section;
    
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    
    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;
    
    @ManyToOne
    @JoinColumn(name = "faculty_id")
    private Faculty faculty;
    
    @ManyToOne
    @JoinColumn(name = "classroom_id")
    private Classroom classroom;
}`,
    'Announcement': `package com.college.assistant.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @ManyToOne
    @JoinColumn(name = "target_department_id")
    private Department targetDepartment;
    
    @ManyToOne
    @JoinColumn(name = "target_year_id")
    private AcademicYear targetYear;
}`
};

for (const [name, content] of Object.entries(entities)) {
    fs.writeFileSync(path.join(entityPath, name + '.java'), content);
    console.log('Created ' + name + '.java');
}
