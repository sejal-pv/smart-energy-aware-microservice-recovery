package com.sejal.energy.healing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HealingLogRepository extends JpaRepository<HealingLog, Long> {
}
