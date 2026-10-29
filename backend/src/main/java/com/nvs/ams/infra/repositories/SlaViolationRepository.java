package com.nvs.ams.infra.repositories;

import com.nvs.ams.domain.models.SlaViolation;
import com.nvs.ams.domain.models.enums.SlaMetric;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface SlaViolationRepository extends JpaRepository<SlaViolation, Long> {

    boolean existsByTicketIdAndMetricAndDeadlineAt(
            Long ticketId, SlaMetric metric, Instant deadlineAt);

    List<SlaViolation> findByDetectedAtGreaterThanEqualAndDetectedAtLessThanOrderByDetectedAtDesc(
            Instant from, Instant to);
}
