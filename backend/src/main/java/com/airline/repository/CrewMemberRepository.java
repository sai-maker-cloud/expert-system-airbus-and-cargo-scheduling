package com.airline.repository;

import com.airline.model.CrewMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CrewMemberRepository extends JpaRepository<CrewMember, Long> {
    Optional<CrewMember> findByEmployeeId(String employeeId);
    List<CrewMember> findByStatus(CrewMember.CrewStatus status);
    List<CrewMember> findByRoleAndStatus(CrewMember.CrewRole role, CrewMember.CrewStatus status);
    List<CrewMember> findByBaseStation(String baseStation);

    @Query("SELECT c FROM CrewMember c WHERE c.status = 'AVAILABLE' AND c.hoursFlownToday < :maxHours ORDER BY c.hoursFlownToday ASC")
    List<CrewMember> findAvailableCrewUnderHourLimit(@Param("maxHours") double maxHours);
}
