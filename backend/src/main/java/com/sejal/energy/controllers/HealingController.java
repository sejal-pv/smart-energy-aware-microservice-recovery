package com.sejal.energy.controllers;

import org.springframework.web.bind.annotation.*;

import com.sejal.energy.healing.HealingDecisionService;
import com.sejal.energy.healing.HealingService;

import java.util.HashMap;
import java.util.Map;

//@RestController
//@RequestMapping("/api/healing")
@CrossOrigin(origins = "http://localhost:3000")
public class HealingController {

    private final HealingDecisionService decisionService;
    private final HealingService healingService;

    public HealingController(
            HealingDecisionService decisionService,
            HealingService healingService
    ) {
        this.decisionService = decisionService;
        this.healingService = healingService;
    }

    // 🔥 AUTO HEAL + ENERGY OPTIMIZATION
    @PostMapping("/auto")
    public Map<String, String> autoHeal(@RequestBody Map<String, Object> req) {

        String service = (String) req.get("service");
        String prediction = (String) req.get("prediction");
        double cpu = Double.parseDouble(req.get("cpu").toString());
        double memory = Double.parseDouble(req.get("memory").toString());

        String action = decisionService.decideFinalAction(
                prediction, cpu, memory
        );

        String result = healingService.executeAction(service, action);

        Map<String, String> response = new HashMap<>();
        response.put("service", service);
        response.put("action", action);
        response.put("result", result);

        return response;
    }

    // 🧪 Manual test
    @GetMapping("/test")
    public String test() {
        return "Healing & energy optimization simulation triggered";
    }
}
