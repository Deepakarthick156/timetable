package com.college.assistant.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "internal_marks")
@Data
public class InternalMark {
    @Id
    private String id;

    private String assessmentName;
    private Double marks;
    private Double maxMarks;

    @DBRef
    private Student student;

    @DBRef
    private Subject subject;
}
