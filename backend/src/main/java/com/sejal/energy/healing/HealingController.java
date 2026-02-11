// HealingController.java
package com.sejal.energy.healing;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/healing")
@CrossOrigin(origins = "http://localhost:3000")
public class HealingController {
    
    @Autowired
    private HealingService healingService;
    
    // Add this endpoint to get healing logs
    @GetMapping("/logs")
    public ResponseEntity<List<HealingLog>> getHealingLogs() {
        List<HealingLog> logs = healingService.getRecentLogs(10);
        return ResponseEntity.ok(logs);
    }
    
    // Add a test endpoint to generate sample logs
    @PostMapping("/test-log")
    public ResponseEntity<HealingLog> createTestLog() {
        HealingLog log = new HealingLog();
        log.setServiceName("payment-service");
        log.setActionTaken("RESTART_SERVICE");
        log.setCluster(2);
        log.setStatus("SUCCESS");
        
        // Save to database
        healingService.saveHealing("payment-service", 2, "RESTART_SERVICE");
        
        return ResponseEntity.ok(log);
    }
}