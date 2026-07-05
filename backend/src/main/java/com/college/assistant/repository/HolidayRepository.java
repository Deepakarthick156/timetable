package com.college.assistant.repository;

import com.college.assistant.entity.Holiday;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.mongodb.repository.Query;
import java.util.List;
import java.time.LocalDate;

@Repository
public interface HolidayRepository extends MongoRepository<Holiday, String> {
    @Query("{ 'holidayDate': { $gte: ?0 } }")
    List<Holiday> findUpcoming(LocalDate date);
}
