package com.college.assistant.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalTime;

@Document(collection = "timetables")
@Data
public class Timetable {
    @Id
    private String id;

    private String departmentId;

    private String yearId;

    private String sectionId;

    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;

    private String subjectId;
    
    @org.springframework.data.annotation.Transient
    private Subject subject;

    private String facultyId;
    
    @org.springframework.data.annotation.Transient
    private Faculty faculty;

    private String classroomId;
    
    @org.springframework.data.annotation.Transient
    private Classroom classroom;
}