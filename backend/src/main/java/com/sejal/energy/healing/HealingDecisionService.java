package com.sejal.energy.healing;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class HealingDecisionService {

    @Autowired
    private EnergyOptimizationService energyService;

    public String decideFinalAction(
            String prediction,
            double cpu,
            double memory
    ) {

        prediction = prediction.toLowerCase();

        // 🔧 FAILURE HEALING (Priority)
        if (prediction.contains("high") || prediction.contains("overload")) {
            return "RESTART_SERVICE";
        }

        // ⚡ ENERGY OPTIMIZATION
        String energyAction =
                energyService.decideEnergyAction(cpu, memory, prediction);

        if (!energyAction.equals("NO_ENERGY_ACTION")) {
            return energyAction;
        }

        return "NO_ACTION";
    }

    public String decideAction(String prediction) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'decideAction'");
    }
}
