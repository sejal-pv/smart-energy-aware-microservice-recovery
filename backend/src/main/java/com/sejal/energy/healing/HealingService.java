package com.sejal.energy.healing;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class HealingService {

    @Autowired
    private HealingLogRepository repo;

    // =====================================
    // Save healing log
    // =====================================
    public void saveHealing(String service, int cluster, String action) {
        HealingLog log = new HealingLog();
        log.setServiceName(service);
        log.setCluster(cluster);
        log.setActionTaken(action);
        log.setTimestamp(LocalDateTime.now());
        repo.save(log);
    }

    // =====================================
    // Execute healing action
    // =====================================
    public String executeAction(String service, String action) {

        String result;

        switch (action) {

            case "RESTART_SERVICE":
                System.out.println("🔁 Restarting service: " + service);
                result = "Service restarted";
                break;

            case "ENERGY_SCALE_DOWN":
                System.out.println("⚡ Scaling DOWN for energy saving: " + service);
                result = "Scaled down to save energy";
                break;

            case "ENERGY_SCALE_UP":
                System.out.println("⚡ Pre-scaling for predicted load: " + service);
                result = "Scaled up for predicted load";
                break;

            case "ENERGY_STABLE":
                System.out.println("✅ Energy stable — no change for: " + service);
                result = "Energy stable";
                break;

            default:
                result = "No action required";
        }

        return result;
    }

    // =====================================
    // Cluster-based auto-healing decision
    // =====================================
    public String processClusterAlert(
            String serviceName,
            int cluster,
            Map<String, Object> metrics) {

        /*
         Cluster meaning:
         0 → Low load
         1 → Medium load
         2 → High load / Risky
        */

        String action;

        if (cluster == 2) {
            action = "RESTART_SERVICE";
        } else if (cluster == 0) {
            action = "ENERGY_SCALE_DOWN";
        } else {
            action = "ENERGY_STABLE";
        }

        String result = executeAction(serviceName, action);
        saveHealing(serviceName, cluster, action);

        return result;
    }

    // =====================================
    // Manual healing trigger
    // =====================================
    public String executeHealing(String service, String action) {
        String result = executeAction(service, action);
        saveHealing(service, -1, action);
        return result;
    }

    // =====================================
    // Required by HealingActionsController
    // =====================================
    public String restartService() {
        return executeHealing("backend", "RESTART_SERVICE");
    }

    public String scaleUp() {
        return executeHealing("backend", "ENERGY_SCALE_UP");
    }

    public String scaleDown() {
        return executeHealing("backend", "ENERGY_SCALE_DOWN");
    }

    public List<HealingLog> getRecentLogs(int i) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getRecentLogs'");
    }
}
