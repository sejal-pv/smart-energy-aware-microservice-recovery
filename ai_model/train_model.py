# ================================================================
#                SMART ENERGY – CLUSTER TRAINING PIPELINE
# ================================================================

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, classification_report
)
import joblib
import os

# ================================================================
# 1. TRAINING FUNCTION (Cluster + Classifier + Pipeline Save)
# ================================================================
def train_cluster_pipeline(df, save_path=None, n_clusters=3, random_state=42):
    """
    Creates:
        - Feature scaler
        - KMeans cluster model
        - RandomForest classifier to predict cluster
        - Saves everything in cloud_cluster_model.pkl
    """

    # -------- Features Used for Clustering --------
    feature_cols = [
        "CPU_Usage (%)", "Memory_Usage (MB)", "Network_Usage (MBps)",
        "Disk_IO (MBps)", "Energy_Consumption (Watts)", "Service_Latency (ms)",
        "Predicted_Workload (%)", "Workload_Type", "Task_Priority"
    ]

    # Extract X
    X = df[feature_cols].copy()

    # -------- Feature Engineering --------
    X["cpu_mem_ratio"] = X["CPU_Usage (%)"] / (X["Memory_Usage (MB)"] + 1)
    X["network_disk_ratio"] = X["Network_Usage (MBps)"] / (X["Disk_IO (MBps)"] + 1)
    X["energy_latency_ratio"] = X["Energy_Consumption (Watts)"] / (X["Service_Latency (ms)"] + 1)

    # -------- Standardize Features --------
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # -------- KMeans Clustering --------
    kmeans = KMeans(n_clusters=n_clusters, random_state=random_state)
    cluster_labels = kmeans.fit_predict(X_scaled)
    df["Cluster_Label"] = cluster_labels

    # -------- Train Classifier to Predict Clusters --------
    clf = RandomForestClassifier(n_estimators=200, random_state=random_state)

    X_train, X_test, y_train, y_test = train_test_split(
        X, cluster_labels, test_size=0.2, random_state=random_state, stratify=cluster_labels
    )

    clf.fit(X_train, y_train)

    # -------- CLASSIFIER EVALUATION METRICS --------
    y_pred = clf.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="macro")
    rec = recall_score(y_test, y_pred, average="macro")
    f1 = f1_score(y_test, y_pred, average="macro")

    print("\n📌 CLASSIFIER PERFORMANCE METRICS")
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print("\nDetailed Report:")
    print(classification_report(y_test, y_pred))

    # -------- Saving Pipeline --------
    pipeline_obj = {
        "scaler": scaler,
        "kmeans": kmeans,
        "classifier": clf,
        "feature_cols": X.columns.tolist()
    }

    if save_path is None:
        save_path = os.path.join(os.path.dirname(__file__), "cloud_cluster_model.pkl")

    joblib.dump(pipeline_obj, save_path)
    print(f"\n💾 Saved model → {save_path}")

    return pipeline_obj


# ================================================================
# 2. MAIN TRAINING SCRIPT
# ================================================================
if __name__ == "__main__":

    print("📌 Loading dataset...")
    df = pd.read_csv("cloud_resource_allocation_dataset.csv")

    # Encode Workload Type
    print("📌 Encoding Workload_Type...")
    le = LabelEncoder()
    df["Workload_Type"] = le.fit_transform(df["Workload_Type"])

    print("📌 Starting cluster training (3 clusters)...")
    model = train_cluster_pipeline(df)

    print("\n🎉 TRAINING COMPLETE!")
