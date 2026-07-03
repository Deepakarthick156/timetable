package com.college.assistant.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalTime;

@Document(collection = "exam_schedules")
@Data
public class ExamSchedule {
    @Id
    private String id;

    private String examName;
    private LocalDate examDate;
    private LocalTime startTime;
    private LocalTime endTime;

    @DBRef
    private Department department;

    @DBRef
    private AcademicYear year;

    @DBRef
    private Section section;

    @DBRef
    private Subject subject;

    @DBRef
    private Classroom classroom;
}
