package com.sejal.energy.metrics;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sejal.energy.service.MetricsCollectorService;

@RestController
@RequestMapping("/api/metrics")
public class MetricsController {

    private final MetricsCollectorService metricsService;

    public MetricsController(MetricsCollectorService metricsService) {
        this.metricsService = metricsService;
    }

    @GetMapping
    public Map<String, Object> getAllMetrics() {
        return metricsService.collectAllMetrics();
    }

    @GetMapping("/cpu")
    public double getCpu() {
        return metricsService.getCpuMetrics();
    }

    @GetMapping("/memory")
    public double getMemory() {
        return metricsService.getMemoryMetrics();
    }

    @GetMapping("/network")
    public double getNetwork() {
        return metricsService.getNetworkMetrics();
    }

    @GetMapping("/energy")
    public double getEnergy() {
        return metricsService.getEnergyMetrics();
    }
}
