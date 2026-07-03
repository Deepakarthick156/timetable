package com.college.assistant.repository;

import com.college.assistant.entity.ExamSchedule;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExamScheduleRepository extends MongoRepository<ExamSchedule, String> {
    List<ExamSchedule> findByDepartment_IdAndYear_IdAndSection_Id(String departmentId, String yearId, String sectionId);
}
