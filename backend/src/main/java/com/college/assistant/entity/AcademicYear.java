package com.college.assistant.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "academic_years")
@Data
public class AcademicYear {
    @Id
    private String id;
    private String yearName;
    private Integer level;
}