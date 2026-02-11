
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class KubernetesService {

    public List<Map<String, String>> getPods() {
        List<Map<String, String>> pods = new ArrayList<>();

        pods.add(Map.of(
            "name", "payment-service",
            "namespace", "default",
            "status", "Running",
            "node", "node-1"
        ));

        pods.add(Map.of(
            "name", "order-service",
            "namespace", "default",
            "status", "Pending",
            "node", "node-2"
        ));

        return pods;
    }
}
