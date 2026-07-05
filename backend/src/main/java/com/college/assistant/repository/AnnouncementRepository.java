package com.college.assistant.repository;

import com.college.assistant.entity.Announcement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.mongodb.repository.Query;
import java.util.List;

@Repository
public interface AnnouncementRepository extends MongoRepository<Announcement, String> {
    @Query("{ $or: [ " +
           "{ 'targetDepartmentId': ?0, 'targetYearId': ?1 }, " +
           "{ 'targetDepartmentId': ?0, 'targetYearId': null }, " +
           "{ 'targetDepartmentId': null, 'targetYearId': ?1 }, " +
           "{ 'targetDepartmentId': null, 'targetYearId': null } " +
           "] }")
    List<Announcement> findRelevant(String departmentId, String yearId);
}
