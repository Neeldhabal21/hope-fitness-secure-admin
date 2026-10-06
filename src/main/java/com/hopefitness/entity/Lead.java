package com.hopefitness.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "leads", indexes = {
        @Index(name = "idx_lead_created_at", columnList = "createdAt"),
        @Index(name = "idx_lead_status", columnList = "status")
})
public class Lead {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 100)
    private String name;
    @Column(nullable = false, length = 20)
    private String phone;
    @Column(length = 160)
    private String email;
    @Column(length = 80)
    private String interestedPlan;
    @Column(length = 1000)
    private String message;
    @Column(nullable = false, length = 30)
    private String status = "NEW";
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getInterestedPlan() { return interestedPlan; }
    public void setInterestedPlan(String interestedPlan) { this.interestedPlan = interestedPlan; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}
