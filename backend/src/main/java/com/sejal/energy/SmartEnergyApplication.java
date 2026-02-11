package com.sejal.energy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.sejal.energy")
public class SmartEnergyApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartEnergyApplication.class, args);
    }
}
