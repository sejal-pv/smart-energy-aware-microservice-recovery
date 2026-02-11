package com.sejal.energy.metrics;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="metrics")
public class Metric {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    private String serviceName;
    private Double cpu;
    private Double memory;
    private Double network;
    private Double diskIO;
    private Double energy;
    private Long latencyMs;
    private Instant timestamp = Instant.now();

    public Long getId() { return id; }
    public String getServiceName() { return serviceName; }
    public void setServiceName(String s) { this.serviceName=s; }
    public Double getCpu() { return cpu; }
    public void setCpu(Double c) { this.cpu=c; }
    public Double getMemory() { return memory; }
    public void setMemory(Double m) { this.memory=m; }
    public Double getNetwork() { return network; }
    public void setNetwork(Double n) { this.network=n; }
    public Double getDiskIO() { return diskIO; }
    public void setDiskIO(Double d) { this.diskIO=d; }
    public Double getEnergy() { return energy; }
    public void setEnergy(Double e) { this.energy=e; }
    public Long getLatencyMs() { return latencyMs; }
    public void setLatencyMs(Long l) { this.latencyMs=l; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant t) { this.timestamp=t; }
}
