package com.hopefitness.controller;

import com.hopefitness.dto.LeadRequest;
import com.hopefitness.entity.Lead;
import com.hopefitness.repository.LeadRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/leads")
public class LeadController {
    private final LeadRepository repo;
    public LeadController(LeadRepository repo) { this.repo = repo; }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody LeadRequest request) {
        Lead lead = new Lead();
        lead.setName(request.name().trim());
        lead.setPhone(request.phone().trim());
        lead.setEmail(blankToNull(request.email()));
        lead.setInterestedPlan(blankToNull(request.interestedPlan()));
        lead.setMessage(blankToNull(request.message()));
        lead.setStatus("NEW");
        repo.save(lead);
        return ResponseEntity.status(201).body(Map.of("message", "Lead submitted successfully"));
    }

    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
