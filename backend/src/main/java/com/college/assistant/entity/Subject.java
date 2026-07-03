package com.college.assistant.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "subjects")
@Data
public class Subject {
    @Id
    private String id;

    private String name;
    private String code;
    private String type; // e.g., THEORY, LAB
}