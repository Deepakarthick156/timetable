package com.college.assistant.repository;

import com.college.assistant.entity.InternalMark;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InternalMarkRepository extends MongoRepository<InternalMark, String> {
    List<InternalMark> findByStudent_Id(String studentId);
}
