# Quantum Globe Navigator

An interactive web-based educational tool bridging geographic coordinates with single-qubit quantum states on the Bloch sphere. Designed for classrooms, workshops, and self-paced learning, this application provides an intuitive visual bridge between linear algebra, quantum circuits (Qiskit-style), and spherical geometry.

---

## 🌍 Educational Objectives

By using this tool, students will learn:

1. **The Bloch Sphere Geometry**: How any pure single-qubit state $\vert{}\psi\rangle = \cos(\frac{\theta}{2})\vert{}0\rangle + e^{i\phi}\sin(\frac{\theta}{2})\vert{}1\rangle$ maps directly to latitude and longitude coordinates on a globe.
2. **Quantum Gate Operators**: How rotation gates like $R_y(\theta)$ (polar rotation) and $R_z(\phi)$ (azimuthal rotation) alter state vectors.
3. **Probability Amplitudes**: How state vectors dictate measurement probabilities for $\vert{}0\rangle$ and $\vert{}1\rangle$ states.
4. **Quantum Circuits**: How geometric coordinates translate into concrete quantum gate sequences.

---

## 🚀 Quick Start Guide

### Prerequisites

* Python 3.8+
* Flask & NumPy

### Installation & Execution

1. Install the required dependencies:
```bash
pip install -r requirements.txt

```


2. Run the application:
```bash
python main.py

```


3. Open your browser and navigate to `http://localhost:5000` (or your Codespaces forwarded public port).

---

## 🧭 How to Use the Modules (Classroom Activities)

### 1. Task 1: Quantum Gate Globe Tuning (Target Matching)

* **Goal**: Tune a qubit's state using quantum gates to match a selected world destination.
* **How to Play**:
1. Use the search bar to look up any city worldwide (powered by open geospatial geocoding).
2. Use the **$Ry(\theta)$** and **$Rz(\phi)$** gate operator buttons (`-0.5`, `-0.1`, `+0.1`, `+0.5`) to rotate the quantum state vector.
3. Watch the **Live Bloch Vector HUD** and the **State Probabilities ($\vert{}0\rangle$ & $\vert{}1\rangle$)** update in real-time.
4. When your applied gate angles precisely align with the city's coordinates, a **"Superposed! Exact Target Match"** banner will trigger!



### 2. Task 2: Location to Circuit (Inverse Mapping)

* **Goal**: Understand how geographic coordinates generate quantum circuits.
* **How to Play**:
1. Type or search for any location on Earth.
2. The backend calculates its polar ($\theta$) and azimuthal ($\phi$) angles.
3. Inspect the generated Qiskit-style gate sequence (`Ry` and `Rz` operations) required to prepare a qubit pointing directly at that location.



### 3. Task 3: Random State Tour (Superposition Exploration)

* **Goal**: Explore probability distributions and global geography simultaneously.
* **How to Play**:
1. Click **🎲 Entangle & Teleport**.
2. The system rolls a random uniform quantum state vector across the Bloch sphere.
3. Observe how random wave-function collapse maps to random worldwide coordinates on the transparent 3D wireframe mesh globe.



---

## 💡 Lesson Plan Ideas for Educators

* **Exercise 1 (The North Pole):** Reset the qubit to $\vert{}0\rangle$ (`θ = 0`). Where does the pin land on the globe? (*Answer: North Pole / 90°N*). What are the probabilities for $\vert{}0\rangle$ and $\vert{}1\rangle$?
* **Exercise 2 (Equator Superposition):** Apply an $Ry(\pi/2)$ gate (`θ = 0.50π`). What percentage are the $\vert{}0\rangle$ and $\vert{}1\rangle$ probability bars? (*Answer: Exactly 50% each, representing a balanced superposition on the equator*).
* **Exercise 3 (Phase Exploration):** Keep $\theta$ constant while adjusting the $R_z$ gate ($\phi$). Does the probability of measuring $\vert{}0\rangle$ or $\vert{}1\rangle$ change? (*Answer: No, global phase / relative phase does not change measurement probabilities, but it rotates the state around the Z-axis*).