package com.sejal.energy.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sejal.energy.backend.InsightsService;
import com.sejal.energy.healing.HealingLog;
import com.sejal.energy.healing.HealingLogRepository;
import com.sejal.energy.metrics.Metric;
import com.sejal.energy.metrics.MetricRepository;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin
public class ReportController {

    @Autowired
    private HealingLogRepository healingRepo;

    @Autowired
    private MetricRepository metricRepo;

    @Autowired
    private InsightsService insightsService;

    // =====================================
    // INSIGHTS SUMMARY
    // =====================================
    @GetMapping("/insights")
    public Map<String, Object> getInsightsSummary() {
        return insightsService.generateInsights();
    }

    // =====================================
    // EXPORT HEALING LOGS AS CSV
    // =====================================
    @GetMapping("/healing/csv")
    public ResponseEntity<String> exportHealingLogsCSV() {

        List<HealingLog> logs = healingRepo.findAll();

        StringBuilder csv = new StringBuilder();
        csv.append("ID,Service,Cluster,Action,Timestamp\n");

        for (HealingLog log : logs) {
            csv.append(log.getId()).append(",")
               .append(log.getServiceName()).append(",")
               .append(log.getClass()).append(",")
               .append(log.getActionTaken()).append(",")
               .append(log.getTimestamp()).append("\n");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=healing_report.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csv.toString());
    }

    // =====================================
    // EXPORT METRICS AS CSV
    // =====================================
    @GetMapping("/metrics/csv")
    public ResponseEntity<String> exportMetricsCSV() {

        List<Metric> metrics = metricRepo.findAll();

        StringBuilder csv = new StringBuilder();
        csv.append("CPU,Memory,Network,Disk,Timestamp\n");

        for (Metric m : metrics) {
            csv.append(m.getCpu()).append(",")
               .append(m.getMemory()).append(",")
               .append(m.getNetwork()).append(",")
               .append(m.getDiskIO()).append(",")
               .append(m.getTimestamp()).append("\n");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=metrics_report.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csv.toString());
    }
}
