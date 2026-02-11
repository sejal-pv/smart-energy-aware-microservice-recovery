package com.sejal.energy.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.stereotype.Service;

@Service
public class MetricsCollectorService {

    private final Random random = new Random();

    public Map<String, Object> collectAllMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("cpu", getCpuMetrics());
        metrics.put("memory", getMemoryMetrics());
        metrics.put("network", getNetworkMetrics());
        metrics.put("energy", getEnergyMetrics());
        return metrics;
    }

    public double getCpuMetrics() {
        return 20 + random.nextDouble() * 70;
    }

    public double getMemoryMetrics() {
        return 500 + random.nextDouble() * 1500;
    }

    public double getNetworkMetrics() {
        return random.nextDouble() * 100;
    }

    public double getEnergyMetrics() {
        return 100 + random.nextDouble() * 400;
    }
}
