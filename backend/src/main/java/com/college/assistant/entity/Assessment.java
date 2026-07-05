package com.college.assistant.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "assessments")
@Data
public class Assessment {
    @Id
    private String id;

    private String title;
    private LocalDate assessmentDate;
    private Integer maxMarks;

    private String departmentId;

    private String yearId;

    private String sectionId;

    private String subjectId;
}
