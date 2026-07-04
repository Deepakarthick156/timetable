package com.college.assistant.repository;

import com.college.assistant.entity.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentRepository extends MongoRepository<Student, String> {
    Optional<Student> findByUser_Id(String userId);
    boolean existsByRegisterNumber(String registerNumber);
    Optional<Student> findByRegisterNumber(String registerNumber);
}
