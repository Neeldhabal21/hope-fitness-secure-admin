package com.hopefitness.controller;

import com.hopefitness.dto.StatusRequest;
import com.hopefitness.entity.Lead;
import com.hopefitness.repository.LeadRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final LeadRepository repo;
    private static final Set<String> STATUSES = Set.of("NEW", "CONTACTED", "CONVERTED", "CLOSED");

    public AdminController(LeadRepository repo) { this.repo = repo; }

    @GetMapping("/leads")
    public Map<String,Object> leads(@RequestParam(defaultValue = "") String q,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "10") int size) {
        int safeSize = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(Math.max(page, 0), safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Lead> result = q.isBlank() ? repo.findAll(pageable) : repo.findByNameContainingIgnoreCaseOrPhoneContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q, q, pageable);
        Map<String,Object> out = new LinkedHashMap<>();
        out.put("content", result.getContent().stream().map(this::safeLead).toList());
        out.put("page", result.getNumber()); out.put("size", result.getSize());
        out.put("totalElements", result.getTotalElements()); out.put("totalPages", result.getTotalPages());
        return out;
    }

    @GetMapping("/stats")
    public Map<String,Long> stats() {
        long total = repo.count();
        long today = repo.findAll().stream().filter(l -> l.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate().equals(LocalDate.now())).count();
        return Map.of("total", total, "new", repo.countByStatus("NEW"), "contacted", repo.countByStatus("CONTACTED"), "converted", repo.countByStatus("CONVERTED"), "today", today);
    }

    @PatchMapping("/leads/{id}")
    public ResponseEntity<?> status(@PathVariable Long id, @Valid @RequestBody StatusRequest request) {
        String status = request.status().trim().toUpperCase(Locale.ROOT);
        if (!STATUSES.contains(status)) return ResponseEntity.badRequest().body(Map.of("message", "Invalid status"));
        return repo.findById(id).map(lead -> { lead.setStatus(status); repo.save(lead); return ResponseEntity.ok(safeLead(lead)); })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/leads/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id); return ResponseEntity.noContent().build();
    }

    private Map<String,Object> safeLead(Lead l) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id", l.getId()); m.put("name", l.getName()); m.put("phone", l.getPhone());
        m.put("email", l.getEmail()); m.put("interestedPlan", l.getInterestedPlan()); m.put("message", l.getMessage());
        m.put("status", l.getStatus()); m.put("createdAt", l.getCreatedAt());
        return m;
    }
}
