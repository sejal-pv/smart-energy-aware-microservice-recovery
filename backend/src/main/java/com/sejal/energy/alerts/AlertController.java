package com.sejal.energy.alerts;

import com.sejal.energy.healing.HealingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @Autowired
    private HealingService healingService;

    // 🔍 Health/test endpoint
    @GetMapping("/test")
    public String testEndpoint() {
        return "AlertController is running!";
    }

    // 📩 AI → backend alert receiver
    @PostMapping
    public Map<String, String> receiveAlert(@RequestBody Map<String, Object> data) throws Exception {

        String serviceName = data.get("serviceName").toString();
        Map<String, Object> metrics = (Map<String, Object>) data.get("metrics");

        // Optional cluster (your cluster model)
        int cluster = 0;
        if (data.containsKey("cluster")) {
            cluster = Integer.parseInt(data.get("cluster").toString());
        }

        String action = healingService.processClusterAlert(serviceName, cluster, metrics);

        return Map.of(
                "status", "received",
                "cluster", "" + cluster,
                "action", action
        );
    }
}
