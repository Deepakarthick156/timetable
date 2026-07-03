package com.college.assistant.repository;

import com.college.assistant.entity.Classroom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassroomRepository extends MongoRepository<Classroom, String> {
}
