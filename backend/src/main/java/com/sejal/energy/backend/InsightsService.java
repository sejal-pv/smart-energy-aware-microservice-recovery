package com.sejal.energy.backend;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sejal.energy.healing.HealingLog;
import com.sejal.energy.healing.HealingLogRepository;
import com.sejal.energy.metrics.Metric;
import com.sejal.energy.metrics.MetricRepository;

@Service
public class InsightsService {

    @Autowired
    private HealingLogRepository healingRepo;

    @Autowired
    private MetricRepository metricRepo;

    public Map<String, Object> generateInsights() {

        Map<String, Object> insights = new HashMap<>();

        List<HealingLog> logs = healingRepo.findAll();
        List<Metric> metrics = metricRepo.findAll();

        // =====================================
        // HEALING INSIGHTS
        // =====================================
        insights.put("totalHealings", logs.size());

        long highRiskCount = logs.stream()
                .filter(l -> l.getActionTaken() != null &&
                        (l.getActionTaken().toLowerCase().contains("restart")
                      || l.getActionTaken().toLowerCase().contains("scale")))
                .count();

        insights.put("highRiskActions", highRiskCount);

        if (!logs.isEmpty()) {
            HealingLog last = logs.get(logs.size() - 1);
            insights.put("lastFailureTime", last.getTimestamp());
            insights.put("lastAction", last.getActionTaken());
        } else {
            insights.put("lastFailureTime", "N/A");
            insights.put("lastAction", "N/A");
        }

        // =====================================
        // METRIC INSIGHTS
        // =====================================
        double avgCpu = metrics.stream()
                .mapToDouble(Metric::getCpu)
                .average()
                .orElse(0);

        double avgMemory = metrics.stream()
                .mapToDouble(Metric::getMemory)
                .average()
                .orElse(0);

        insights.put("averageCPU", Math.round(avgCpu * 100.0) / 100.0);
        insights.put("averageMemory", Math.round(avgMemory * 100.0) / 100.0);

        // =====================================
        // AI-READABLE SUMMARY
        // =====================================
        String summary;

        if (highRiskCount > 5) {
            summary = "System experienced frequent high-risk failures. Energy optimization recommended.";
        } else if (!logs.isEmpty()) {
            summary = "System is stable with occasional recovery actions.";
        } else {
            summary = "System running smoothly with no recovery actions.";
        }

        insights.put("summary", summary);

        return insights;
    }
}
