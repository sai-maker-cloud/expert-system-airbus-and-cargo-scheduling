package com.airline.repository;

import com.airline.model.Cargo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CargoRepository extends JpaRepository<Cargo, Long> {
    Optional<Cargo> findByTrackingNumber(String trackingNumber);
    List<Cargo> findByStatus(Cargo.CargoStatus status);
    List<Cargo> findByPriority(Cargo.CargoPriority priority);
    List<Cargo> findByDestination(String destination);
    List<Cargo> findByFlightId(Long flightId);

    @Query("SELECT c FROM Cargo c WHERE c.status = 'PENDING' ORDER BY c.priority DESC, c.createdAt ASC")
    List<Cargo> findPendingCargoByPriority();

    @Query("SELECT c FROM Cargo c WHERE c.destination = :dest AND c.status = 'PENDING' ORDER BY c.priority DESC")
    List<Cargo> findPendingCargoForDestination(@Param("dest") String destination);
}
