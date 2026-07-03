const fs = require('fs');
const path = require('path');

const basePackage = path.join(__dirname, 'src', 'main', 'java', 'com', 'college', 'assistant');
const servicePath = path.join(basePackage, 'service');
const controllerPath = path.join(basePackage, 'controller');

const files = {
    [path.join(servicePath, 'TimetableService.java')]: `package com.college.assistant.service;

import com.college.assistant.entity.Student;
import com.college.assistant.entity.Timetable;
import com.college.assistant.repository.StudentRepository;
import com.college.assistant.repository.TimetableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TimetableService {
    private final TimetableRepository timetableRepository;
    private final StudentRepository studentRepository;

    public List<Timetable> getTimetableForStudent(Long userId) {
        Optional<Student> studentOpt = studentRepository.findByUserId(userId);
        if (studentOpt.isEmpty()) {
            return List.of();
        }
        Student student = studentOpt.get();
        return timetableRepository.findByDepartmentIdAndYearIdAndSectionId(
                student.getDepartment().getId(),
                student.getYear().getId(),
                student.getSection().getId()
        );
    }
}`,
    [path.join(servicePath, 'AiService.java')]: `package com.college.assistant.service;

import com.college.assistant.entity.Timetable;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiService {

    @Value("\${app.gemini.api-key:mock-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String askQuestion(String question, List<Timetable> timetableList) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("mock-key")) {
            return "Mock AI Response: Your question was '" + question + "'. Please configure Gemini API key.";
        }

        String timetableContext = timetableList.stream()
                .map(t -> String.format("%s %s-%s: %s (Faculty: %s, Room: %s)", 
                        t.getDayOfWeek(), t.getStartTime(), t.getEndTime(), 
                        t.getSubject().getName(), t.getFaculty().getName(), t.getClassroom().getRoomNumber()))
                .collect(Collectors.joining("\\n"));

        String prompt = "You are a helpful AI College TimeTable Assistant. Answer the user's question based ONLY on the following timetable:\\n" 
                + timetableContext + "\\n\\nUser Question: " + question;

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=" + apiKey;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            String requestBody = "{\\"contents\\":[{\\"parts\\":[{\\"text\\":\\"" + prompt.replace("\\"", "\\\\\\"").replace("\\n", "\\\\n") + "\\"}]}]}";
            
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    return (String) parts.get(0).get("text");
                }
            }
            return "Could not generate response.";
        } catch (Exception e) {
            return "Error calling AI API: " + e.getMessage();
        }
    }
}`,
    [path.join(controllerPath, 'StudentPortalController.java')]: `package com.college.assistant.controller;

import com.college.assistant.entity.Timetable;
import com.college.assistant.entity.User;
import com.college.assistant.repository.UserRepository;
import com.college.assistant.service.AiService;
import com.college.assistant.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentPortalController {

    private final TimetableService timetableService;
    private final AiService aiService;
    private final UserRepository userRepository;

    @GetMapping("/timetable")
    public ResponseEntity<List<Timetable>> getMyTimetable() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> userOpt = userRepository.findByUsername(auth.getName());
        
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(timetableService.getTimetableForStudent(userOpt.get().getId()));
        }
        return ResponseEntity.status(401).build();
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chatWithAi(@RequestBody Map<String, String> request) {
        String question = request.get("question");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> userOpt = userRepository.findByUsername(auth.getName());
        
        if (userOpt.isPresent()) {
            List<Timetable> timetable = timetableService.getTimetableForStudent(userOpt.get().getId());
            String response = aiService.askQuestion(question, timetable);
            return ResponseEntity.ok(Map.of("response", response));
        }
        return ResponseEntity.status(401).build();
    }
}`
};

for (const [filePath, content] of Object.entries(files)) {
    fs.writeFileSync(filePath, content);
    console.log('Created ' + path.basename(filePath));
}
