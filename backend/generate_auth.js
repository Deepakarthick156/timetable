const fs = require('fs');
const path = require('path');

const basePackage = path.join(__dirname, 'src', 'main', 'java', 'com', 'college', 'assistant');
const dtoPath = path.join(basePackage, 'dto');
const servicePath = path.join(basePackage, 'service');
const controllerPath = path.join(basePackage, 'controller');

[dtoPath, servicePath, controllerPath].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const files = {
    [path.join(dtoPath, 'AuthenticationRequest.java')]: `package com.college.assistant.dto;

import lombok.Data;

@Data
public class AuthenticationRequest {
    private String username;
    private String password;
}`,
    [path.join(dtoPath, 'AuthenticationResponse.java')]: `package com.college.assistant.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthenticationResponse {
    private String token;
    private String role;
}`,
    [path.join(dtoPath, 'RegisterRequest.java')]: `package com.college.assistant.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String role; // ADMIN or STUDENT
    // For student registration
    private String registerNumber;
    private String name;
    private Long departmentId;
    private Long yearId;
    private Long sectionId;
}`,
    [path.join(servicePath, 'AuthService.java')]: `package com.college.assistant.service;

import com.college.assistant.dto.AuthenticationRequest;
import com.college.assistant.dto.AuthenticationResponse;
import com.college.assistant.dto.RegisterRequest;
import com.college.assistant.entity.*;
import com.college.assistant.repository.*;
import com.college.assistant.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final AcademicYearRepository yearRepository;
    private final SectionRepository sectionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        var user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.valueOf(request.getRole().toUpperCase()));
        
        userRepository.save(user);

        if (user.getRole() == Role.STUDENT) {
            var student = new Student();
            student.setUser(user);
            student.setRegisterNumber(request.getRegisterNumber());
            student.setName(request.getName());
            
            departmentRepository.findById(request.getDepartmentId()).ifPresent(student::setDepartment);
            yearRepository.findById(request.getYearId()).ifPresent(student::setYear);
            sectionRepository.findById(request.getSectionId()).ifPresent(student::setSection);
            
            studentRepository.save(student);
        }

        var springUser = new org.springframework.security.core.userdetails.User(
            user.getUsername(), user.getPassword(), java.util.Collections.emptyList()
        );
        var jwtToken = jwtUtil.generateToken(springUser);
        
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();
        var springUser = new org.springframework.security.core.userdetails.User(
            user.getUsername(), user.getPassword(), java.util.Collections.emptyList()
        );
        var jwtToken = jwtUtil.generateToken(springUser);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .build();
    }
}`,
    [path.join(controllerPath, 'AuthController.java')]: `package com.college.assistant.controller;

import com.college.assistant.dto.AuthenticationRequest;
import com.college.assistant.dto.AuthenticationResponse;
import com.college.assistant.dto.RegisterRequest;
import com.college.assistant.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }
}`
};

for (const [filePath, content] of Object.entries(files)) {
    fs.writeFileSync(filePath, content);
    console.log('Created ' + path.basename(filePath));
}
