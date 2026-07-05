package com.college.assistant.service;

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
            if (studentRepository.existsByRegisterNumber(request.getRegisterNumber())) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Register number already exists");
            }

            var student = new Student();
            student.setUserId(user.getId());
            student.setRegisterNumber(request.getRegisterNumber());
            student.setName(request.getName());
            
            student.setDepartmentId(request.getDepartmentId());
            student.setYearId(request.getYearId());
            student.setSectionId(request.getSectionId());
            
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
}