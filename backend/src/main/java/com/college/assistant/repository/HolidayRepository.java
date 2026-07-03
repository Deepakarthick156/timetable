package com.college.assistant.repository;

import com.college.assistant.entity.Holiday;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HolidayRepository extends MongoRepository<Holiday, String> {
}
