"""
generate_diagrams.py  (Day 29 - Project Finalization)

Regenerates the two diagrams used in the README and the submission deck
directly from the project's own code, instead of keeping hand-drawn
images that can drift out of sync with the implementation:

    docs/architecture.png     - the 5-module system diagram
    docs/quantum_circuit.png  - the actual Qiskit circuit, drawn by Qiskit
    docs/entropy_histogram.png - a real simulator run's measurement counts

Run this after any change to the pipeline stages or the circuit so the
documentation always reflects the current code.
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as patches

from quantum.circuit_builder import build_entropy_circuit
from quantum.ibm_backend import run_on_simulator
from qiskit.visualization import plot_histogram

DOCS_DIR = os.path.join(os.path.dirname(__file__), "..", "docs")


def draw_architecture():
    fig, ax = plt.subplots(figsize=(11, 5))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 5)
    ax.axis("off")

    boxes = {
        "1": ("Input Data\n(Classical Keys / Files)", 0.5, 3.2),
        "2": ("PQC Vulnerability Assessor\n(Risk Analysis Engine)", 4.0, 3.2),
        "3": ("Key Migration Engine\n(Kyber / Dilithium Encoders)", 7.5, 3.2),
        "4": ("Quantum Entropy / Simulation Node\n(Qiskit / IBM Backend)", 4.0, 0.8),
        "5": ("Secure Output & Logs\n(Post-Quantum Safe Assets)", 7.5, 0.8),
    }

    for key, (label, x, y) in boxes.items():
        box = patches.FancyBboxPatch(
            (x, y), 3.0, 1.1, boxstyle="round,pad=0.08",
            linewidth=1.3, edgecolor="#2b3a55", facecolor="#eef2fb"
        )
        ax.add_patch(box)
        ax.text(x + 1.5, y + 0.55, label, ha="center", va="center", fontsize=9.5, color="#1a2338")

    def arrow(x1, y1, x2, y2):
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                     arrowprops=dict(arrowstyle="->", lw=1.4, color="#2b3a55"))

    arrow(3.5, 3.75, 4.0, 3.75)
    arrow(7.0, 3.75, 7.5, 3.75)
    arrow(5.5, 3.2, 5.5, 1.9)
    arrow(7.0, 1.35, 7.5, 1.35)

    ax.set_title("Post-Quantum Cryptography Migration Toolkit - System Architecture", fontsize=12, color="#1a2338")
    fig.tight_layout()
    fig.savefig(os.path.join(DOCS_DIR, "architecture.png"), dpi=200)
    plt.close(fig)


def draw_quantum_circuit():
    circuit = build_entropy_circuit(oracle_nonce=b"docs-regen")
    fig = circuit.draw(output="mpl")
    fig.savefig(os.path.join(DOCS_DIR, "quantum_circuit.png"), dpi=200, bbox_inches="tight")


def draw_entropy_histogram():
    circuit = build_entropy_circuit(oracle_nonce=b"docs-regen")
    result = run_on_simulator(circuit, shots=1024)
    fig = plot_histogram(result.counts, title="Entropy circuit output (1024 shots, Aer simulator)")
    fig.savefig(os.path.join(DOCS_DIR, "entropy_histogram.png"), dpi=200, bbox_inches="tight")
    return result.counts


if __name__ == "__main__":
    os.makedirs(DOCS_DIR, exist_ok=True)
    draw_architecture()
    draw_quantum_circuit()
    counts = draw_entropy_histogram()
    print("Diagrams written to docs/:")
    print("  architecture.png")
    print("  quantum_circuit.png")
    print("  entropy_histogram.png")
    print(f"Latest simulator counts used for the histogram: {counts}")