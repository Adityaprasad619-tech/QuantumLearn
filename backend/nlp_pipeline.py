# backend/nlp_pipeline.py
"""
QuantumLearn - Quantum NLP & Intent Classification Engine
Performs tokenization, entity/concept extraction, intent classification,
and difficulty detection before constructing prompts for Groq LLM.
"""

import re
from typing import Dict, Any, List, Set, Optional

INTENTS = [
    "GENERATE_CODE",
    "DEBUG_CODE",
    "EXPLAIN_CODE",
    "OPTIMIZE_CODE",
    "VISUALIZE",
    "QUIZ",
    "HINT",
    "LEARN_CONCEPT",
    "GENERAL_QUESTION"
]

CONCEPT_TAXONOMY = {
    "superposition": ["superposition", "hadamard", "|+>", "|->", "equal probability", "50/50", "wave function", "amplitude"],
    "entanglement": ["entangle", "entanglement", "bell state", "epr", "spooky action", "cnot", "cx", "correlated"],
    "measurement": ["measure", "measurement", "collapse", "born rule", "probabilities", "shots", "counts"],
    "bloch_sphere": ["bloch", "sphere", "pole", "latitude", "longitude", "rotation", "rx", "ry", "rz"],
    "quantum_gates": ["gate", "pauli", "unitary", "phase", "phase flip", "bit flip", "t gate", "s gate", "swap", "toffoli", "ccx"],
    "teleportation": ["teleport", "teleportation", "alice", "bob", "classical channel", "state transfer"],
    "qft": ["qft", "fourier", "phase estimation", "frequency", "period finding"],
    "grover": ["grover", "search", "oracle", "diffusion", "amplitude amplification", "quadratic speedup"],
    "shor": ["shor", "factor", "factorization", "rsa", "prime", "order finding", "modular exponentiation"]
}

DIFFICULTY_KEYWORDS = {
    "beginner": ["what is", "simple", "easy", "explain like", "beginner", "how does", "basics", "why does"],
    "advanced": ["hamiltonian", "density matrix", "lindblad", "decoherence", "schmidt", "singular value", "lie algebra", "fidelity", "entropy", "subspace"],
    "intermediate": ["eigenvalue", "unitary", "tensor product", "statevector", "phase kickback", "circuit depth", "ancilla"]
}

class NLPPipeline:
    @staticmethod
    def preprocess_text(text: str) -> str:
        return text.strip().lower()

    @classmethod
    def classify_intent(cls, query: str, context_has_error: bool = False) -> str:
        q = cls.preprocess_text(query)

        # 1. Debugging intent
        if context_has_error or any(w in q for w in ["error", "bug", "traceback", "exception", "failed", "broken", "fix this", "why does this fail", "invalid qubit", "syntax error"]):
            return "DEBUG_CODE"

        # 2. Optimization intent
        if any(w in q for w in ["optimize", "simplify", "reduce depth", "cancel gates", "fewer gates", "redundant", "compress"]):
            return "OPTIMIZE_CODE"

        # 3. Generation intent
        if any(w in q for w in ["create", "generate", "write code", "make a circuit", "build a circuit", "implement", "code for", "how to code", "write a program"]):
            return "GENERATE_CODE"

        # 4. Explanation of code
        if any(w in q for w in ["explain this code", "what does this line", "line by line", "break down this code", "explain the circuit"]):
            return "EXPLAIN_CODE"

        # 5. Hint intent
        if any(w in q for w in ["hint", "clue", "don't give me the answer", "guide me", "nudge"]):
            return "HINT"

        # 6. Visualization intent
        if any(w in q for w in ["show me", "visualize", "bloch sphere", "draw", "plot", "graphic", "display"]):
            return "VISUALIZE"

        # 7. Quiz / assessment intent
        if any(w in q for w in ["quiz me", "test me", "challenge me", "question for me", "assess"]):
            return "QUIZ"

        # 8. Learning concept
        if any(w in q for w in ["what is", "how does", "difference between", "tell me about", "why do we use"]):
            return "LEARN_CONCEPT"

        return "GENERAL_QUESTION"

    @classmethod
    def extract_concepts(cls, query: str) -> List[str]:
        q = cls.preprocess_text(query)
        detected = []
        for concept, keywords in CONCEPT_TAXONOMY.items():
            if any(k in q for k in keywords):
                detected.append(concept)
        return detected or ["quantum_foundations"]

    @classmethod
    def detect_difficulty(cls, query: str, user_level: int = 1) -> str:
        q = cls.preprocess_text(query)
        for w in DIFFICULTY_KEYWORDS["advanced"]:
            if w in q:
                return "advanced"
        for w in DIFFICULTY_KEYWORDS["beginner"]:
            if w in q:
                return "beginner"
        for w in DIFFICULTY_KEYWORDS["intermediate"]:
            if w in q:
                return "intermediate"

        if user_level >= 3:
            return "advanced"
        elif user_level == 2:
            return "intermediate"
        return "beginner"

    @classmethod
    def extract_qubits_mentioned(cls, query: str) -> List[int]:
        matches = re.findall(r'qubit\s*(\d+)', query.lower())
        return [int(m) for m in matches]

    @classmethod
    def analyze_query(
        cls,
        query: str,
        context: Optional[Dict[str, Any]] = None,
        current_code: Optional[str] = None,
        current_circuit_gates: Optional[List[Dict[str, Any]]] = None,
        user_level: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Full NLP Analysis Pipeline. Returns structured metadata.
        """
        ctx = context or {}
        has_error = bool(ctx.get("currentError"))
        level = user_level or ctx.get("userLevel", 1)

        intent = cls.classify_intent(query, context_has_error=has_error)
        concepts = cls.extract_concepts(query)
        difficulty = cls.detect_difficulty(query, user_level=level)
        qubits = cls.extract_qubits_mentioned(query)
        is_code = bool(re.search(r'(qc\.|def |import |from |qiskit|circ|\[|\{)', query)) or bool(current_code)

        return {
            "intent": intent,
            "concepts": concepts,
            "difficulty": difficulty,
            "qubits_detected": qubits,
            "is_code_related": is_code or intent in ["GENERATE_CODE", "DEBUG_CODE", "OPTIMIZE_CODE", "EXPLAIN_CODE"],
            "requires_sandbox_validation": intent in ["GENERATE_CODE", "DEBUG_CODE", "OPTIMIZE_CODE"]
        }


nlp_pipeline = NLPPipeline()
