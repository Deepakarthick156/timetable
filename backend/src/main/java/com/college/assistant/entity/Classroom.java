package com.college.assistant.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "classrooms")
@Data
public class Classroom {
    @Id
    private String id;

    private String roomNumber;
    private String type; // e.g., CLASS, LAB
}