package com.college.assistant.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "students")
@Data
public class Student {
    @Id
    private String id;

    private String registerNumber;
    private String name;

    private String departmentId;

    private String yearId;

    private String sectionId;

    private String userId;
}