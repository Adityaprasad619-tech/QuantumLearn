# backend/seed_data.py
"""
Initial Seed Data for QuantumLearn SQLite Database.
Populates standard demonstration student and researcher accounts, benchmark metrics,
and sample quantum experiments.
"""

import json
from sqlalchemy.orm import Session
from models import User, UserProgress, SavedCircuit, ResearchExperiment, BenchmarkMetric
from auth_utils import hash_password


def seed_database(db: Session):
    """Seed initial data if not present."""
    # Check if already seeded
    existing_user = db.query(User).filter_by(email="student@quantumlearn.edu").first()
    if existing_user:
        return

    print("[INFO] Seeding QuantumLearn database with demo student and researcher...")

    # 1. Demo Student
    student1 = User(
        id="usr_student_alex",
        email="student@quantumlearn.edu",
        password_hash=hash_password("quantum123"),
        name="Alex Rivera",
        role="student",
        institution="Department of Physics, State University",
        grade_or_title="Undergraduate Physics (Year 3)",
        field_of_study="Quantum Information & Optics"
    )
    db.add(student1)

    student1_progress = UserProgress(
        user_id=student1.id,
        xp=420,
        level=3,
        streak_days=5,
        completed_lessons=json.dumps(["lesson-1-1", "lesson-1-2", "lesson-1-3", "lesson-2-1"]),
        completed_challenges=json.dumps(["ch-1", "ch-2"]),
        concept_mastery=json.dumps({
            "bits": 0.95,
            "qubit": 0.88,
            "superposition": 0.82,
            "gates_x": 0.90,
            "gates_h": 0.86,
            "measurement": 0.75,
            "entanglement": 0.65
        })
    )
    db.add(student1_progress)

    student1_circuit = SavedCircuit(
        id="circ_bell_phi_plus",
        user_id=student1.id,
        name="Bell State (|Φ+⟩) Generator",
        description="Canonical 2-qubit maximally entangled state preparation with Hadamard and CNOT",
        num_qubits=2,
        gates_json=json.dumps([
            {"type": "H", "targets": [0], "controls": []},
            {"type": "CNOT", "targets": [1], "controls": [0]}
        ])
    )
    db.add(student1_circuit)

    # 2. Second Student (For cohort analytics)
    student2 = User(
        id="usr_student_maya",
        email="maya@quantumlearn.edu",
        password_hash=hash_password("quantum123"),
        name="Maya Lin",
        role="student",
        institution="Institute of Quantum Computing",
        grade_or_title="Senior CS & Quantum Computing",
        field_of_study="Quantum Algorithms & Complexity"
    )
    db.add(student2)

    student2_progress = UserProgress(
        user_id=student2.id,
        xp=780,
        level=4,
        streak_days=11,
        completed_lessons=json.dumps(["lesson-1-1", "lesson-1-2", "lesson-2-1", "lesson-2-2", "lesson-3-1", "lesson-3-2"]),
        completed_challenges=json.dumps(["ch-1", "ch-2", "ch-3"]),
        concept_mastery=json.dumps({
            "bits": 0.98,
            "qubit": 0.94,
            "superposition": 0.91,
            "gates_x": 0.95,
            "gates_h": 0.94,
            "measurement": 0.85,
            "entanglement": 0.89,
            "grover": 0.72
        })
    )
    db.add(student2_progress)

    # 3. Demo Researcher
    researcher = User(
        id="usr_researcher_eleanor",
        email="researcher@quantumlearn.edu",
        password_hash=hash_password("quantum123"),
        name="Dr. Eleanor Vance",
        role="researcher",
        institution="Quantum Information & Advanced Computing Laboratory",
        grade_or_title="Lead Quantum Research Scientist",
        field_of_study="Fault-Tolerant Quantum Architectures & State Characterization"
    )
    db.add(researcher)

    researcher_progress = UserProgress(
        user_id=researcher.id,
        xp=2500,
        level=10,
        streak_days=24,
        completed_lessons=json.dumps([]),
        completed_challenges=json.dumps([]),
        concept_mastery=json.dumps({
            "qubit": 1.0,
            "superposition": 1.0,
            "entanglement": 1.0,
            "grover": 0.98,
            "qft": 0.97,
            "shor": 0.95
        })
    )
    db.add(researcher_progress)

    # Seed Researcher Experiments
    exp1 = ResearchExperiment(
        id="exp_bell_chsh_001",
        user_id=researcher.id,
        title="Bell-CHSH Inequality Violation Benchmark",
        experiment_type="bell_chsh",
        description="Non-locality verification using correlation expectation values ⟨QS⟩ + ⟨RS⟩ + ⟨RT⟩ - ⟨QT⟩. Exceeds classical Tsirelson bound (2.0).",
        qubit_count=2,
        circuit_json=json.dumps([
            {"type": "H", "targets": [0]},
            {"type": "CNOT", "targets": [1], "controls": [0]}
        ]),
        metrics_json=json.dumps({
            "chshParameter": 2.784,
            "classicalBound": 2.000,
            "tsirelsonBound": 2.828,
            "violationSigma": "19.6σ",
            "stateFidelity": 0.988,
            "entropy": 0.994,
            "shots": 8192,
            "executionTimeMs": 14.2
        }),
        status="completed"
    )
    db.add(exp1)

    exp2 = ResearchExperiment(
        id="exp_qft_phase_002",
        user_id=researcher.id,
        title="3-Qubit Quantum Fourier Transform Phase Coherence",
        experiment_type="qft_benchmark",
        description="Characterization of geometric relative phase rotations R_k on 3-qubit register. Verification of Walsh-Hadamard basis change.",
        qubit_count=3,
        circuit_json=json.dumps([
            {"type": "H", "targets": [0]},
            {"type": "RZ", "targets": [0], "params": {"theta": 1.5708}},
            {"type": "H", "targets": [1]}
        ]),
        metrics_json=json.dumps({
            "phaseCoherence": 0.976,
            "targetFrequency": "0.375 (3/8)",
            "peakProbability": 0.952,
            "stateFidelity": 0.972,
            "shots": 4096,
            "executionTimeMs": 22.8
        }),
        status="completed"
    )
    db.add(exp2)

    exp3 = ResearchExperiment(
        id="exp_vqe_h2_003",
        user_id=researcher.id,
        title="VQE Ansatz for Molecular Hydrogen (H2) Ground State",
        experiment_type="vqe_ansatz",
        description="Variational quantum eigensolver Ry-Rz parameterized ansatz minimizing Hamiltonian expectation value ⟨H⟩ at bond distance 0.741Å.",
        qubit_count=2,
        circuit_json=json.dumps([
            {"type": "X", "targets": [0]},
            {"type": "RY", "targets": [0], "params": {"theta": 0.384}},
            {"type": "CNOT", "targets": [1], "controls": [0]}
        ]),
        metrics_json=json.dumps({
            "groundEnergyHartree": -1.1372,
            "fciReferenceHartree": -1.1373,
            "energyErrorMilliHartree": 0.1,
            "chemicalAccuracyAchieved": True,
            "iterations": 32,
            "shots": 4096,
            "executionTimeMs": 48.6
        }),
        status="completed"
    )
    db.add(exp3)

    # 4. Hardware Benchmarks
    benchmarks = [
        BenchmarkMetric(
            id="bm_ibm_eagle",
            qpu_name="IBM Eagle r3",
            qubits=127,
            avg_gate_fidelity=0.9982,
            two_qubit_fidelity=0.9845,
            t1_us=112.4,
            t2_us=98.6,
            quantum_volume=128,
            status="ONLINE"
        ),
        BenchmarkMetric(
            id="bm_rigetti_aspen",
            qpu_name="Rigetti Aspen-M-3",
            qubits=79,
            avg_gate_fidelity=0.9945,
            two_qubit_fidelity=0.9720,
            t1_us=36.8,
            t2_us=31.4,
            quantum_volume=64,
            status="ONLINE"
        ),
        BenchmarkMetric(
            id="bm_ionq_forte",
            qpu_name="IonQ Forte Trapped Ion",
            qubits=36,
            avg_gate_fidelity=0.9994,
            two_qubit_fidelity=0.9935,
            t1_us=10500.0,
            t2_us=1450.0,
            quantum_volume=256,
            status="ONLINE"
        ),
        BenchmarkMetric(
            id="bm_ql_sim",
            qpu_name="QuantumLearn Statevector Engine",
            qubits=8,
            avg_gate_fidelity=1.0000,
            two_qubit_fidelity=1.0000,
            t1_us=999999.0,
            t2_us=999999.0,
            quantum_volume=512,
            status="IDEAL_SIMULATOR"
        )
    ]
    for bm in benchmarks:
        db.add(bm)

    db.commit()
    print("[SUCCESS] Database seeded successfully!")
