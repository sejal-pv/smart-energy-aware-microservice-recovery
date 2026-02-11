package com.sejal.energy.controllers;

import com.sejal.energy.k8s.KubernetesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/k8s")
@CrossOrigin
public class KubernetesController {

    @Autowired
    private KubernetesService service;

    @GetMapping("/pods")
    public List<Map<String, String>> getPods() {
        return service.getPods();
    }
}
