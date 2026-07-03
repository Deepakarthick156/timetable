package com.college.assistant.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "holidays")
@Data
public class Holiday {
    @Id
    private String id;

    private String name;
    private LocalDate holidayDate;
    private String type;
}
