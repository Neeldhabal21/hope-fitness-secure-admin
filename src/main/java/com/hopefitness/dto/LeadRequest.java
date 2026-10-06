package com.hopefitness.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LeadRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Pattern(regexp = "^[0-9+()\\- ]{7,20}$", message = "Invalid phone number") String phone,
        @Email @Size(max = 160) String email,
        @Size(max = 80) String interestedPlan,
        @Size(max = 1000) String message
) {}
