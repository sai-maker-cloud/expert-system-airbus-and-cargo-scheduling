package com.airline.repository;

import com.airline.model.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {
    Optional<Flight> findByFlightNumber(String flightNumber);
    List<Flight> findByStatus(Flight.FlightStatus status);
    List<Flight> findByOriginAndDestination(String origin, String destination);

    @Query("SELECT f FROM Flight f WHERE f.origin = :origin AND f.destination = :destination AND f.departureTime > :after AND f.status IN ('SCHEDULED', 'BOARDING') ORDER BY f.departureTime ASC")
    List<Flight> findUpcomingFlights(@Param("origin") String origin, @Param("destination") String destination, @Param("after") LocalDateTime after);

    @Query("SELECT f FROM Flight f WHERE f.aircraft IS NULL AND f.status = 'SCHEDULED'")
    List<Flight> findUnassignedFlights();

    @Query("SELECT f FROM Flight f WHERE SIZE(f.crewMembers) = 0 AND f.status = 'SCHEDULED'")
    List<Flight> findFlightsWithoutCrew();

    @Query("SELECT f FROM Flight f WHERE f.departureTime BETWEEN :start AND :end")
    List<Flight> findFlightsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
