package com.college.assistant.service;

import com.college.assistant.entity.Timetable;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.college.assistant.repository.*;
import com.college.assistant.entity.*;
import org.springframework.web.client.RestTemplate;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiService {

    @Value("${app.gemini.api-key:mock-key}")
    private String apiKey;

    @Value("${app.gemini.model:gemini-2.5-flash}")
    private String model;

    private final RestTemplate restTemplate;
    private final SubjectRepository subjectRepository;
    private final FacultyRepository facultyRepository;
    private final ClassroomRepository classroomRepository;

    @org.springframework.beans.factory.annotation.Autowired
    public AiService(SubjectRepository subjectRepository, FacultyRepository facultyRepository, ClassroomRepository classroomRepository) {
        this.subjectRepository = subjectRepository;
        this.facultyRepository = facultyRepository;
        this.classroomRepository = classroomRepository;
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(60000);
        this.restTemplate = new RestTemplate(factory);
    }

    public String askQuestion(String question, String contextData) {
        if (question == null || question.isBlank()) {
            return "How can I help you today?";
        }
        
        String q = question.toLowerCase(Locale.ROOT);
        
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("mock-key")) {
            return "I can answer basic timetable questions. For full AI capability, an API key is required.";
        }

        String currentDate = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("EEEE, yyyy-MM-dd"));
        String tomorrowDate = java.time.LocalDate.now().plusDays(1).format(java.time.format.DateTimeFormatter.ofPattern("EEEE, yyyy-MM-dd"));
        String prompt = "You are a highly efficient AI College TimeTable Assistant. " 
                + "CRITICAL INSTRUCTIONS: Provide ONLY the abstract information requested. Be extremely brief, direct, and professional. Do not include any conversational filler, emojis, exclamations, assumptions, explanations, or boilerplate (e.g., do not say 'enjoy', 'Considering your current dashboard' or 'Assuming you mean'). Just output the requested details directly in a formal tone. "
                + "1. GREETINGS: If the user says hello, hi, or hlo, respond naturally and politely, and ask how you can help them. "
                + "2. COUNTING: If asked to count things (like 'how many days have a lab' or 'how many holidays'), CAREFULLY COUNT the unique entries in your context before answering to ensure your number matches the items you list. "
                + "3. HOLIDAYS: When listing holidays, use a strictly formal and abstract tone (e.g., 'July 10 is a holiday'). Remove any informal remarks, emojis, or slang (like 'enjoyyyy' or 'yay') that might be present in the holiday name from the database. Just state the date and that it is a holiday. ABSOLUTELY NEVER invent, guess, or hallucinate reasons for a holiday (e.g., do not say 'due to heavy rain' or 'due to maintenance'). If no reason is explicitly provided, simply state it is a holiday. Never start with 'No' if it is a holiday. If the user asks if a specific day (like tomorrow) is a holiday, and it is NOT in the holiday list, you MUST answer explicitly: 'No, tomorrow is a working day.' or 'No, it is a working day.' "
                + "4. DEFAULT DAY: If the user asks about their schedule, free hours, classes, or labs without specifying a day (e.g., 'Do I have any free hours?'), assume they are asking about TODAY. "
                + "5. NEXT CLASS / HOLIDAYS: If they ask for their next class and the immediate next day is a holiday, DO NOT say they have a class on the holiday. Skip the holiday entirely and state their actual next class on a valid working day. Make sure your sentences are logically sound and do not contradict themselves. "
                + "6. TONE & FORMAT: Use natural phrasing for days (like 'tomorrow' or 'Monday'). Use proper grammar, avoid run-on sentences, and speak like a helpful but strictly professional human assistant. NEVER output robotic full dates (like 2026-07-05) in your answers, use relative terms like 'tomorrow' or natural dates like 'July 10'. Keep negative answers ultra-simple, like 'No labs tomorrow' or 'No'. "
                + "7. EXACT DATES & DAYS: Never recalculate or guess the day of the week. Today's exact date and day (and tomorrow's) are provided below. Trust this information exactly as written. "
                + "8. FREE HOURS: A 'free hour' or 'free period' is ONLY an empty gap BETWEEN TWO CLASSES ON THE SAME DAY. Do not count the time after classes end for the day, or overnight time between days, as 'free hours'. If there are no gaps between classes on a given day, state clearly that they have no free hours that day. "
                + "9. GRACEFUL NEGATIVE ANSWERS: If a specific person (e.g., a professor) is asked about and not found in the timetable, respond formally like '[Name] does not take any classes for you.' Do not say they 'cannot be found in your timetable'. NEVER list out all the other professors, subjects, or items you checked. Give a direct, formal, and brief answer. "
                + "10. EXAMS: If the user asks about exams or tests and there are no exams listed in the context, you MUST strictly reply with exactly: 'No exam scheduled yet.' Do not say 'There is no information in the context'. "
                + "11. LABS: Labs are explicitly marked with the '[LAB]' tag in the timetable. If the user asks if they have a lab, look ONLY for classes that start with '[LAB]'. Ignore the room name entirely. "
                + "Today is " + currentDate + ". Tomorrow is " + tomorrowDate + ". "
                + "Here is the student's current dashboard context:\n" + contextData + "\n\nUser Question: " + question;

        System.out.println("----- AI PROMPT START -----");
        System.out.println(prompt);
        System.out.println("----- AI PROMPT END -----");

        try {
            if (apiKey.startsWith("gsk_")) {
                String url = "https://api.groq.com/openai/v1/chat/completions";
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("Authorization", "Bearer " + apiKey);
                
                String safePrompt = prompt.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
                String requestBody = "{\"messages\":[{\"role\":\"user\",\"content\":\"" + safePrompt + "\"}],\"model\":\"llama-3.1-8b-instant\"}";
                
                HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
                
                Map<String, Object> body = response.getBody();
                if (body != null && body.containsKey("choices")) {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
                    if (!choices.isEmpty()) {
                        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                        return (String) message.get("content");
                    }
                }
                return "Could not generate response from Groq.";
            } else {
                String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                
                String requestBody = "{\"contents\":[{\"parts\":[{\"text\":\"" + prompt.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "") + "\"}]}]}";
                
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
            }
        } catch (Exception e) {
            return "Error calling AI API: " + e.getMessage();
        }
    }

    private String extractContextSection(String contextData, String startMarker, String endMarker, String emptyMessage) {
        int start = contextData.indexOf(startMarker);
        if (start == -1) return emptyMessage;
        
        start += startMarker.length();
        int end = endMarker != null ? contextData.indexOf(endMarker, start) : -1;
        if (end == -1) end = contextData.length();
        
        String section = contextData.substring(start, end).trim();
        if (section.isEmpty()) return emptyMessage;
        
        return section;
    }

    private String answerFromTimetable(String question, List<Timetable> timetableList) {
        if (question == null || question.isBlank()) {
            return "Ask me about today's timetable, your next class, free hours, labs, faculty, classrooms, or a subject.";
        }
        if (timetableList == null || timetableList.isEmpty()) {
            return "I could not find a timetable for your department, year, and section. Please ask the admin to upload it.";
        }

        String q = question.toLowerCase(Locale.ROOT);
        List<Timetable> sorted = timetableList.stream()
                .sorted(Comparator.comparing((Timetable t) -> dayOrder(t.getDayOfWeek())).thenComparing(Timetable::getStartTime))
                .toList();

        if (q.contains("weekly") || q.contains("week timetable") || q.contains("full timetable")) {
            return formatWeekly(sorted);
        }

        String targetDay = resolveDay(q);
        List<Timetable> dayEntries = sorted.stream()
                .filter(t -> sameDay(t.getDayOfWeek(), targetDay))
                .sorted(Comparator.comparing(Timetable::getStartTime))
                .toList();

        Optional<Timetable> subjectMatch = findSubjectMatch(q, sorted);
        if (subjectMatch.isPresent()) {
            Timetable entry = subjectMatch.get();
            if (q.contains("faculty") || q.contains("who") || q.contains("taking")) {
                return facultyName(entry) + " is handling " + subjectLabel(entry) + ".";
            }
            if (q.contains("where") || q.contains("classroom") || q.contains("room") || q.contains("lab")) {
                return subjectLabel(entry) + " is in " + roomLabel(entry) + " on " + normalizeDay(entry.getDayOfWeek()) + " from " + timeRange(entry) + ".";
            }
            if (q.contains("when")) {
                return subjectLabel(entry) + " is on " + normalizeDay(entry.getDayOfWeek()) + " from " + timeRange(entry) + " in " + roomLabel(entry) + ".";
            }
            if (q.contains("after")) {
                return classAfter(sorted, entry);
            }
        }

        if (q.contains("current class") || q.contains("now") || q.contains("ongoing")) {
            return currentClass(dayEntries);
        }
        if (q.contains("next class") || q.contains("next hour")) {
            return nextClass(dayEntries);
        }
        if (q.contains("first hour") || q.contains("1st hour") || q.contains("first class")) {
            return nthClass(dayEntries, 1, targetDay);
        }
        if (q.contains("second hour") || q.contains("2nd hour") || q.contains("second class")) {
            return nthClass(dayEntries, 2, targetDay);
        }
        if (q.contains("third hour") || q.contains("3rd hour")) {
            return nthClass(dayEntries, 3, targetDay);
        }
        if (q.contains("last hour") || q.contains("last class")) {
            return dayEntries.isEmpty() ? noClasses(targetDay) : formatSingle("Your last class on " + targetDay + " is", dayEntries.get(dayEntries.size() - 1));
        }
        if (q.contains("morning")) {
            return formatFiltered(dayEntries.stream().filter(t -> t.getStartTime().isBefore(LocalTime.NOON)).toList(), "Morning classes on " + targetDay);
        }
        if (q.contains("afternoon") || q.contains("after lunch")) {
            return formatFiltered(dayEntries.stream().filter(t -> !t.getStartTime().isBefore(LocalTime.NOON)).toList(), "Afternoon classes on " + targetDay);
        }
        if (q.contains("free hour") || q.contains("free period") || q.contains("break")) {
            return freeHours(dayEntries, targetDay);
        }
        if (q.contains("how many") && q.contains("lab")) {
            long labs = dayEntries.stream().filter(this::isLab).count();
            return labs == 0 ? "You do not have any labs on " + targetDay + "." : "You have " + labs + " lab session" + (labs == 1 ? "" : "s") + " on " + targetDay + ".";
        }
        if (q.contains("lab")) {
            List<Timetable> labs = dayEntries.stream().filter(this::isLab).toList();
            return labs.isEmpty() ? "You do not have a lab on " + targetDay + "." : formatFiltered(labs, "Lab sessions on " + targetDay);
        }
        if (q.contains("bring")) {
            List<Timetable> labs = dayEntries.stream().filter(this::isLab).toList();
            if (labs.isEmpty()) {
                return "No lab is scheduled on " + targetDay + ". Bring your regular class notes and any materials shared by faculty.";
            }
            String labNames = labs.stream().map(this::subjectLabel).collect(Collectors.joining(", "));
            return "You have " + labNames + " on " + targetDay + ". Bring your record notebook, observation notebook if required, laptop if needed, and any pending lab work.";
        }
        if (q.contains("2 pm") || q.contains("2pm") || q.contains("14:00")) {
            return classAt(dayEntries, LocalTime.of(14, 0), targetDay);
        }
        if (q.contains("today") || q.contains("tomorrow") || q.contains("yesterday") || containsWeekday(q) || q.contains("timetable") || q.contains("schedule")) {
            return formatFiltered(dayEntries, "Your timetable on " + targetDay);
        }

        return "";
    }

    private String resolveDay(String q) {
        LocalDate today = LocalDate.now();
        if (q.contains("tomorrow")) {
            return normalizeDay(today.plusDays(1).getDayOfWeek().name());
        }
        if (q.contains("yesterday")) {
            return normalizeDay(today.minusDays(1).getDayOfWeek().name());
        }
        for (DayOfWeek day : DayOfWeek.values()) {
            String name = day.name().toLowerCase(Locale.ROOT);
            if (q.contains(name)) {
                return normalizeDay(name);
            }
        }
        return normalizeDay(today.getDayOfWeek().name());
    }

    private boolean containsWeekday(String q) {
        for (DayOfWeek day : DayOfWeek.values()) {
            if (q.contains(day.name().toLowerCase(Locale.ROOT))) {
                return true;
            }
        }
        return false;
    }

        private Optional<Timetable> findSubjectMatch(String q, List<Timetable> timetable) {
        return timetable.stream().filter(t -> {
            if (t.getSubjectId() == null) return false;
            Subject s = subjectRepository.findById(t.getSubjectId()).orElse(null);
            if (s == null) return false;
            String name = s.getName() != null ? s.getName().toLowerCase(java.util.Locale.ROOT) : "";
            String code = s.getCode() != null ? s.getCode().toLowerCase(java.util.Locale.ROOT) : "";
            return (!name.isBlank() && q.contains(name)) || (!code.isBlank() && q.contains(code));
        }).findFirst();
    }

    private String currentClass(List<Timetable> entries) {
        LocalTime now = LocalTime.now();
        return entries.stream()
                .filter(t -> !now.isBefore(t.getStartTime()) && now.isBefore(t.getEndTime()))
                .findFirst()
                .map(t -> formatSingle("Your current class is", t))
                .orElse("You do not have a class running right now.");
    }

    private String nextClass(List<Timetable> entries) {
        LocalTime now = LocalTime.now();
        return entries.stream()
                .filter(t -> t.getStartTime().isAfter(now))
                .findFirst()
                .map(t -> formatSingle("Your next class is", t))
                .orElse("You do not have any more classes today.");
    }

    private String nthClass(List<Timetable> entries, int n, String day) {
        if (entries.size() < n) {
            return "You do not have a " + ordinal(n) + " class on " + day + ".";
        }
        return formatSingle("Your " + ordinal(n) + " class on " + day + " is", entries.get(n - 1));
    }

    private String classAt(List<Timetable> entries, LocalTime time, String day) {
        return entries.stream()
                .filter(t -> !time.isBefore(t.getStartTime()) && time.isBefore(t.getEndTime()))
                .findFirst()
                .map(t -> formatSingle("At " + formatTime(time) + " on " + day + " you have", t))
                .orElse("You do not have a class at " + formatTime(time) + " on " + day + ".");
    }

    private String classAfter(List<Timetable> sorted, Timetable entry) {
        List<Timetable> sameDay = sorted.stream()
                .filter(t -> sameDay(t.getDayOfWeek(), entry.getDayOfWeek()))
                .sorted(Comparator.comparing(Timetable::getStartTime))
                .toList();
        for (int i = 0; i < sameDay.size() - 1; i++) {
            if (sameDay.get(i).getId().equals(entry.getId())) {
                return formatSingle("After " + subjectLabel(entry) + " you have", sameDay.get(i + 1));
            }
        }
        return subjectLabel(entry) + " is your last class on " + normalizeDay(entry.getDayOfWeek()) + ".";
    }

    private String freeHours(List<Timetable> entries, String day) {
        if (entries.size() < 2) {
            return entries.isEmpty() ? noClasses(day) : "No free hour is visible between scheduled classes on " + day + ".";
        }
        List<String> gaps = new java.util.ArrayList<>();
        for (int i = 0; i < entries.size() - 1; i++) {
            Timetable current = entries.get(i);
            Timetable next = entries.get(i + 1);
            if (current.getEndTime().isBefore(next.getStartTime())) {
                gaps.add(formatTime(current.getEndTime()) + " to " + formatTime(next.getStartTime()));
            }
        }
        return gaps.isEmpty()
                ? "You do not have free hours between scheduled classes on " + day + "."
                : "Your free hour slots on " + day + " are " + String.join(", ", gaps) + ".";
    }

    private String formatWeekly(List<Timetable> entries) {
        return entries.stream()
                .collect(Collectors.groupingBy(Timetable::getDayOfWeek, java.util.LinkedHashMap::new, Collectors.toList()))
                .entrySet()
                .stream()
                .map(day -> normalizeDay(day.getKey()) + ":\n" + day.getValue().stream().map(this::formatLine).collect(Collectors.joining("\n")))
                .collect(Collectors.joining("\n\n"));
    }

    private String formatFiltered(List<Timetable> entries, String title) {
        if (entries.isEmpty()) {
            return title + ": no classes scheduled.";
        }
        return title + ":\n" + entries.stream().map(this::formatLine).collect(Collectors.joining("\n"));
    }

    private String formatSingle(String prefix, Timetable t) {
        return prefix + " " + subjectLabel(t) + " from " + timeRange(t) + " in " + roomLabel(t) + " with " + facultyName(t) + ".";
    }

    private String formatLine(Timetable t) {
        return "- " + timeRange(t) + ": " + subjectLabel(t) + " with " + facultyName(t) + " in " + roomLabel(t);
    }

        private String subjectLabel(Timetable t) {
        if (t.getSubjectId() == null) return "Class";
        Subject s = subjectRepository.findById(t.getSubjectId()).orElse(null);
        String name = s != null ? s.getName() : "Class";
        String code = s != null ? s.getCode() : null;
        return code == null || code.isBlank() ? name : name + " (" + code + ")";
    }

        private String facultyName(Timetable t) {
        if (t.getFacultyId() == null) return "the assigned faculty";
        Faculty f = facultyRepository.findById(t.getFacultyId()).orElse(null);
        return f == null || f.getName() == null ? "the assigned faculty" : f.getName();
    }

        private String roomLabel(Timetable t) {
        if (t.getClassroomId() == null) return "the assigned room";
        Classroom c = classroomRepository.findById(t.getClassroomId()).orElse(null);
        if (c == null) return "the assigned room";
        String type = c.getType();
        return (type == null || type.isBlank() ? "Room" : type) + " " + c.getRoomNumber();
    }

        private boolean isLab(Timetable t) {
        Subject s = t.getSubjectId() != null ? subjectRepository.findById(t.getSubjectId()).orElse(null) : null;
        Classroom c = t.getClassroomId() != null ? classroomRepository.findById(t.getClassroomId()).orElse(null) : null;
        String subjectType = s != null && s.getType() != null ? s.getType().toLowerCase(java.util.Locale.ROOT) : "";
        String roomType = c != null && c.getType() != null ? c.getType().toLowerCase(java.util.Locale.ROOT) : "";
        String subjectName = s != null && s.getName() != null ? s.getName().toLowerCase(java.util.Locale.ROOT) : "";
        return subjectType.contains("lab") || roomType.contains("lab") || subjectName.contains("lab");
    }

    private String timeRange(Timetable t) {
        return formatTime(t.getStartTime()) + " to " + formatTime(t.getEndTime());
    }

    private String formatTime(LocalTime time) {
        return time.format(DateTimeFormatter.ofPattern("h:mm a"));
    }

    private boolean sameDay(String a, String b) {
        return normalizeDay(a).equalsIgnoreCase(normalizeDay(b));
    }

    private String normalizeDay(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String lower = value.toLowerCase(Locale.ROOT);
        return lower.substring(0, 1).toUpperCase(Locale.ROOT) + lower.substring(1);
    }

    private int dayOrder(String value) {
        try {
            return DayOfWeek.valueOf(value.toUpperCase(Locale.ROOT)).getValue();
        } catch (Exception ignored) {
            return 8;
        }
    }

    private String ordinal(int n) {
        return switch (n) {
            case 1 -> "first";
            case 2 -> "second";
            case 3 -> "third";
            default -> n + "th";
        };
    }

    private String noClasses(String day) {
        return "You do not have any classes on " + day + ".";
    }
}
