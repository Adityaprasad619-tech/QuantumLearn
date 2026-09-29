# backend/models.py
"""
SQLAlchemy ORM Models for QuantumLearn.
Structured cleanly to match future Supabase / PostgreSQL schema types.
"""

from datetime import datetime, timezone
import json
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(32), default="student", nullable=False)  # 'student' | 'researcher'
    institution = Column(String(255), nullable=True)
    grade_or_title = Column(String(255), nullable=True)
    field_of_study = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    progress = relationship("UserProgress", back_populates="user", uselist=False, cascade="all, delete-orphan")
    saved_circuits = relationship("SavedCircuit", back_populates="user", cascade="all, delete-orphan")
    experiments = relationship("ResearchExperiment", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "institution": self.institution,
            "grade": self.grade_or_title,
            "fieldOfStudy": self.field_of_study,
            "createdAt": int(self.created_at.timestamp() * 1000) if self.created_at else None
        }


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), unique=True, nullable=False)
    xp = Column(Integer, default=100)
    level = Column(Integer, default=1)
    streak_days = Column(Integer, default=1)
    completed_lessons = Column(Text, default="[]")       # JSON array of strings
    completed_challenges = Column(Text, default="[]")    # JSON array of strings
    concept_mastery = Column(Text, default="{}")         # JSON object { concept_id: score }
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="progress")

    def get_completed_lessons(self):
        try:
            return json.loads(self.completed_lessons) if self.completed_lessons else []
        except Exception:
            return []

    def set_completed_lessons(self, lessons_list):
        self.completed_lessons = json.dumps(lessons_list)

    def get_completed_challenges(self):
        try:
            return json.loads(self.completed_challenges) if self.completed_challenges else []
        except Exception:
            return []

    def set_completed_challenges(self, challenges_list):
        self.completed_challenges = json.dumps(challenges_list)

    def get_concept_mastery(self):
        try:
            return json.loads(self.concept_mastery) if self.concept_mastery else {}
        except Exception:
            return {}

    def set_concept_mastery(self, mastery_dict):
        self.concept_mastery = json.dumps(mastery_dict)

    def to_dict(self):
        return {
            "userId": self.user_id,
            "xp": self.xp,
            "level": self.level,
            "streakDays": self.streak_days,
            "completedLessons": self.get_completed_lessons(),
            "completedChallenges": self.get_completed_challenges(),
            "conceptMastery": self.get_concept_mastery(),
            "updatedAt": int(self.updated_at.timestamp() * 1000) if self.updated_at else None
        }


class SavedCircuit(Base):
    __tablename__ = "saved_circuits"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    num_qubits = Column(Integer, default=2)
    gates_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="saved_circuits")

    def to_dict(self):
        try:
            gates = json.loads(self.gates_json) if self.gates_json else []
        except Exception:
            gates = []
        return {
            "id": self.id,
            "userId": self.user_id,
            "name": self.name,
            "description": self.description,
            "numQubits": self.num_qubits,
            "gates": gates,
            "createdAt": int(self.created_at.timestamp() * 1000) if self.created_at else None
        }


class ResearchExperiment(Base):
    __tablename__ = "research_experiments"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    experiment_type = Column(String(64), nullable=False)  # 'bell_chsh', 'state_tomography', 'qft_benchmark', 'vqe_ansatz', 'error_mitigation'
    description = Column(Text, nullable=True)
    qubit_count = Column(Integer, default=2)
    circuit_json = Column(Text, default="[]")
    metrics_json = Column(Text, default="{}")
    status = Column(String(32), default="completed")
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="experiments")

    def to_dict(self):
        try:
            metrics = json.loads(self.metrics_json) if self.metrics_json else {}
        except Exception:
            metrics = {}
        try:
            circuit = json.loads(self.circuit_json) if self.circuit_json else []
        except Exception:
            circuit = []
        return {
            "id": self.id,
            "userId": self.user_id,
            "title": self.title,
            "experimentType": self.experiment_type,
            "description": self.description,
            "qubitCount": self.qubit_count,
            "circuit": circuit,
            "metrics": metrics,
            "status": self.status,
            "createdAt": int(self.created_at.timestamp() * 1000) if self.created_at else None
        }


class BenchmarkMetric(Base):
    __tablename__ = "benchmark_metrics"

    id = Column(String(64), primary_key=True)
    qpu_name = Column(String(128), nullable=False)
    qubits = Column(Integer, nullable=False)
    avg_gate_fidelity = Column(Float, nullable=False)
    two_qubit_fidelity = Column(Float, nullable=False)
    t1_us = Column(Float, nullable=False)
    t2_us = Column(Float, nullable=False)
    quantum_volume = Column(Integer, nullable=False)
    status = Column(String(32), default="ONLINE")

    def to_dict(self):
        return {
            "id": self.id,
            "qpuName": self.qpu_name,
            "qubits": self.qubits,
            "avgGateFidelity": self.avg_gate_fidelity,
            "twoQubitFidelity": self.two_qubit_fidelity,
            "t1Us": self.t1_us,
            "t2Us": self.t2_us,
            "quantumVolume": self.quantum_volume,
            "status": self.status
        }
