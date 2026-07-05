package com.college.assistant.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "announcements")
@Data
public class Announcement {
    @Id
    private String id;

    private String title;
    private String content;
    private LocalDateTime createdAt = LocalDateTime.now();

    private String targetDepartmentId;

    private String targetYearId;
}