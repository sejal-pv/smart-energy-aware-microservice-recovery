package com.sejal.energy.metrics;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MetricRepository extends JpaRepository<Metric, Long> {

    @Query(
        value = "SELECT * FROM metrics ORDER BY timestamp DESC LIMIT ?1",
        nativeQuery = true
    )
    List<Metric> findRecent(int limit);
}
