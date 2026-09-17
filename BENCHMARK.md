# FABLE Benchmark & Comparative Ablation Study

**Evaluation Dataset**: 30 Synthetic User Organizations across 12 Behavioral Scenario Classes.

## Comparative Performance Matrix

| System Architecture | Precision | Recall | F1 Score | False Positive Rate | Alert Reduction % | Context Acc. % | Lead Time |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **FABLE (Full Pipeline)** | **100.0%** | **100.0%** | **100.0%** | **0.0%** | **+100.0%** | **100.0%** | **0.5h** |
| **Baseline 1: Simple Threshold** | **57.9%** | **100.0%** | **73.3%** | **38.1%** | **+0.0%** | **42.9%** | **0.0h** |
| **Baseline 2: Z-Score Only** | **39.3%** | **100.0%** | **56.4%** | **81.0%** | **-112.5%** | **0.0%** | **0.0h** |
| **Baseline 3: Isolation Forest Only** | **84.6%** | **100.0%** | **91.7%** | **9.5%** | **+75.0%** | **85.7%** | **0.0h** |
| **Baseline 4: FABLE No-Context (Ablation)** | **78.6%** | **100.0%** | **88.0%** | **14.3%** | **+62.5%** | **78.6%** | **0.0h** |
| **Baseline 5: FABLE No-Changepoint (Ablation)** | **100.0%** | **72.7%** | **84.2%** | **0.0%** | **+100.0%** | **100.0%** | **0.5h** |

## Key Analytical Findings

1. **Alert Reduction**: FABLE achieves **>80% reduction in false positive alerts** compared to raw threshold detectors by utilizing context ledger attenuation.
2. **Contextualization Accuracy**: 100% of legitimate operational deviations (Sev-1 hotfixes, remote travel, hardware upgrades) were correctly attenuated.
3. **Changepoint Lead Time**: Page-Hinkley cumulative statistics enable **early detection of slow exfiltration** before single-event thresholds trigger.
4. **Zero-False-Lockout for New Hires**: Sparse history protection ensures Day 2 onboarding telemetry never triggers automated containment.