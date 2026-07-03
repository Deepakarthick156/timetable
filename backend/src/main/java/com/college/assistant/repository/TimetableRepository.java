package com.college.assistant.repository;

import com.college.assistant.entity.Timetable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimetableRepository extends MongoRepository<Timetable, String> {
    List<Timetable> findByDepartment_IdAndYear_IdAndSection_Id(String departmentId, String yearId, String sectionId);
}
