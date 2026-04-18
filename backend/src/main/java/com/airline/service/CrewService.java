package com.airline.service;

import com.airline.dto.CrewDto;
import com.airline.exception.BusinessRuleException;
import com.airline.exception.ResourceNotFoundException;
import com.airline.model.CrewMember;
import com.airline.repository.CrewMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CrewService {

    private final CrewMemberRepository crewMemberRepository;

    public List<CrewDto.Response> getAllCrew() {
        return crewMemberRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CrewDto.Response getCrewById(Long id) {
        return toResponse(findById(id));
    }

    public CrewDto.Response createCrew(CrewDto.Request request) {
        if (crewMemberRepository.findByEmployeeId(request.getEmployeeId()).isPresent()) {
            throw new BusinessRuleException("Crew member with employee ID " + request.getEmployeeId() + " already exists");
        }
        CrewMember crew = new CrewMember();
        mapRequestToEntity(request, crew);
        return toResponse(crewMemberRepository.save(crew));
    }

    public CrewDto.Response updateCrew(Long id, CrewDto.Request request) {
        CrewMember crew = findById(id);
        mapRequestToEntity(request, crew);
        return toResponse(crewMemberRepository.save(crew));
    }

    public CrewDto.Response updateStatus(Long id, CrewMember.CrewStatus status) {
        CrewMember crew = findById(id);
        crew.setStatus(status);
        return toResponse(crewMemberRepository.save(crew));
    }

    public void deleteCrew(Long id) {
        CrewMember crew = findById(id);
        if (crew.getStatus() == CrewMember.CrewStatus.ON_DUTY) {
            throw new BusinessRuleException("Cannot delete a crew member who is currently on duty");
        }
        crewMemberRepository.delete(crew);
    }

    public List<CrewDto.Response> getAvailableCrew() {
        return crewMemberRepository.findByStatus(CrewMember.CrewStatus.AVAILABLE).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<CrewDto.Response> getCrewByRole(CrewMember.CrewRole role) {
        return crewMemberRepository.findAll().stream()
                .filter(c -> c.getRole() == role)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private CrewMember findById(Long id) {
        return crewMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Crew member", id));
    }

    private void mapRequestToEntity(CrewDto.Request request, CrewMember crew) {
        crew.setEmployeeId(request.getEmployeeId());
        crew.setFirstName(request.getFirstName());
        crew.setLastName(request.getLastName());
        crew.setRole(request.getRole());
        crew.setLicenseNumber(request.getLicenseNumber());
        crew.setLicenseExpiry(request.getLicenseExpiry());
        crew.setBaseStation(request.getBaseStation());
    }

    public CrewDto.Response toResponse(CrewMember crew) {
        return CrewDto.Response.builder()
                .id(crew.getId())
                .employeeId(crew.getEmployeeId())
                .firstName(crew.getFirstName())
                .lastName(crew.getLastName())
                .fullName(crew.getFullName())
                .role(crew.getRole())
                .licenseNumber(crew.getLicenseNumber())
                .licenseExpiry(crew.getLicenseExpiry())
                .hoursFlownToday(crew.getHoursFlownToday())
                .totalHoursFlown(crew.getTotalHoursFlown())
                .status(crew.getStatus())
                .baseStation(crew.getBaseStation())
                .createdAt(crew.getCreatedAt())
                .build();
    }

    public CrewDto.Summary toSummary(CrewMember crew) {
        return CrewDto.Summary.builder()
                .id(crew.getId())
                .employeeId(crew.getEmployeeId())
                .fullName(crew.getFullName())
                .role(crew.getRole())
                .status(crew.getStatus())
                .build();
    }
}
