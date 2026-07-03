package com.college.assistant.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String role; // ADMIN or STUDENT
    // For student registration
    private String registerNumber;
    private String name;
    private String departmentId;
    private String yearId;
    private String sectionId;
}