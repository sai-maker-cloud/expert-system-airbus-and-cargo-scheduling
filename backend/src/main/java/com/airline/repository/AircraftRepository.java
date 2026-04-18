package com.airline.repository;

import com.airline.model.Aircraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AircraftRepository extends JpaRepository<Aircraft, Long> {
    Optional<Aircraft> findByRegistrationNumber(String registrationNumber);
    List<Aircraft> findByStatus(Aircraft.AircraftStatus status);

    @Query("SELECT a FROM Aircraft a WHERE a.status = 'AVAILABLE' ORDER BY a.fuelEfficiency DESC")
    List<Aircraft> findAvailableAircraftByEfficiency();
}
