package com.sejal.energy.healing;
import com.sejal.energy.healing.KubernetesRecoveryService;

import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.InputStreamReader;

@Service
public class KubernetesRecoveryService {

    private String runCommand(String command) throws Exception {
        ProcessBuilder builder = new ProcessBuilder("sh", "-c", command);
        builder.redirectErrorStream(true);
        Process process = builder.start();

        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        StringBuilder output = new StringBuilder();
        String line;

        while ((line = reader.readLine()) != null) {
            output.append(line).append("\n");
        }

        process.waitFor();
        return output.toString();
    }

    public void scaleDeployment(String deployment, int replicas) throws Exception {
        String cmd = "kubectl scale deployment " + deployment + " --replicas=" + replicas;
        System.out.println(runCommand(cmd));
    }

    public void restartDeployment(String deployment) throws Exception {
        String cmd = "kubectl rollout restart deployment " + deployment;
        System.out.println(runCommand(cmd));
    }

    private String[] getPodsForApp(String appLabel) throws Exception {
        String output = runCommand(
            "kubectl get pods -l app=" + appLabel + " -o jsonpath='{.items[*].metadata.name}'"
        );
        return output.trim().replace("'", "").split("\\s+");
    }

    public void checkAndHealStuckPods(String appLabel) throws Exception {
        String[] pods = getPodsForApp(appLabel);

        for (String pod : pods) {
            String status = runCommand(
                "kubectl get pod " + pod + " -o jsonpath='{.status.containerStatuses[*].state.waiting.reason}'"
            ).trim().replace("'", "");

            if (status.contains("CrashLoopBackOff") || status.contains("ErrImagePull") || status.contains("ImagePullBackOff")) {
                runCommand("kubectl delete pod " + pod);
            }
        }
    }

    public void evictUnhealthyPods(String appLabel) throws Exception {
        String[] pods = getPodsForApp(appLabel);

        for (String pod : pods) {
            String ready = runCommand(
                "kubectl get pod " + pod + " -o jsonpath='{.status.containerStatuses[*].ready}'"
            ).trim().replace("'", "");

            if (ready.equals("false")) {
                runCommand("kubectl delete pod " + pod);
            }
        }
    }
}
