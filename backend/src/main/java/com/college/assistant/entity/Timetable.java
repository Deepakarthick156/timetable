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

    @DBRef
    private Department department;

    @DBRef
    private AcademicYear year;

    @DBRef
    private Section section;

    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;

    @DBRef
    private Subject subject;

    @DBRef
    private Faculty faculty;

    @DBRef
    private Classroom classroom;
}