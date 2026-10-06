package com.hopefitness.dto;

import jakarta.validation.constraints.NotBlank;

public record StatusRequest(@NotBlank String status) {}
