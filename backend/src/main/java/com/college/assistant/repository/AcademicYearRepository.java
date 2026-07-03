package com.college.assistant.repository;

import com.college.assistant.entity.AcademicYear;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AcademicYearRepository extends MongoRepository<AcademicYear, String> {
}
