package com.college.assistant.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "attendances")
@Data
public class Attendance {
    @Id
    private String id;

    private Integer totalClasses;
    private Integer attendedClasses;

    @DBRef
    private Student student;

    @DBRef
    private Subject subject;
}
