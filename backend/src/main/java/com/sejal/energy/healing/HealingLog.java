package com.sejal.energy.healing;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "healing_logs")
public class HealingLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String serviceName;
    private int cluster;
    private String actionTaken;
    private LocalDateTime timestamp;

    // Getters & Setters
    public Long getId() { return id; }
    public String getServiceName() { return serviceName; }
    public int getCluster() { return cluster; }
    public String getActionTaken() { return actionTaken; }
    public LocalDateTime getTimestamp() { return timestamp; }

    public void setServiceName(String serviceName) { this.serviceName = serviceName; }
    public void setCluster(int cluster) { this.cluster = cluster; }
    public void setActionTaken(String actionTaken) { this.actionTaken = actionTaken; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public void setStatus(String string) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setStatus'");
    }
}
