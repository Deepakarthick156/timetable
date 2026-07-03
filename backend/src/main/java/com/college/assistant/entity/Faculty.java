package com.college.assistant.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "faculty")
@Data
public class Faculty {
    @Id
    private String id;

    private String name;

    @DBRef
    private Department department;
}