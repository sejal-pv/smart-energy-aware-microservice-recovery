package com.sejal.energy.healing;
import org.springframework.stereotype.Service;

@Service
public class EnergyOptimizationService {

    public String decideEnergyAction(
            double cpuUsage,
            double memoryUsage,
            String prediction
    ) {

        prediction = prediction.toLowerCase();

        // 🔻 LOW LOAD → SCALE DOWN (ENERGY SAVE)
        if (cpuUsage < 30 && memoryUsage < 500 && prediction.contains("low")) {
            return "ENERGY_SCALE_DOWN";
        }

        // ⚖ MEDIUM LOAD → NO CHANGE
        if (cpuUsage >= 30 && cpuUsage <= 70) {
            return "ENERGY_STABLE";
        }

        // 🔺 HIGH LOAD → SCALE UP ONLY IF PREDICTED
        if (cpuUsage > 70 && prediction.contains("high")) {
            return "ENERGY_SCALE_UP";
        }

        return "NO_ENERGY_ACTION";
    }
}
