package com.college.assistant.repository;

import com.college.assistant.entity.Assessment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssessmentRepository extends MongoRepository<Assessment, String> {
    List<Assessment> findByDepartmentIdAndYearIdAndSectionId(String departmentId, String yearId, String sectionId);
}
