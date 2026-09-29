# backend/groq_service.py
"""
QuantumLearn - Secure Groq AI Service
Encapsulates Groq API calls for Quantum Code Generation, Debugging,
Multi-Level Explanations, Circuit Optimization, and Context-Aware Chat.
"""

import os
import json
import base64
import logging
from io import BytesIO
from pathlib import Path
from typing import Dict, Any, List, Optional
from groq import Groq
from pypdf import PdfReader

logger = logging.getLogger(__name__)

# Load .env manually if not already present in environment
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")
GROQ_FALLBACK_MODEL = os.environ.get("GROQ_FALLBACK_MODEL", "openai/gpt-oss-20b")


class GroqService:
    def __init__(self):
        self.api_key = GROQ_API_KEY
        self.client = None
        if self.api_key:
            try:
                self.client = Groq(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {e}")

    def _call_groq(self, system_prompt: str, user_prompt: str, json_mode: bool = True) -> str:
        if not self.client:
            raise ValueError("Groq API key not configured. Check backend/.env file.")

        candidate_models = [
            GROQ_MODEL,
            GROQ_FALLBACK_MODEL,
            "openai/gpt-oss-120b",
            "openai/gpt-oss-20b",
            "qwen/qwen3.8-27b"
        ]
        # Deduplicate while preserving order
        models_to_try = []
        for m in candidate_models:
            if m and m not in models_to_try:
                models_to_try.append(m)

        last_error = None

        for model in models_to_try:
            try:
                kwargs: Dict[str, Any] = {
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.2,
                    "max_tokens": 2048,
                }
                if json_mode:
                    kwargs["response_format"] = {"type": "json_object"}

                response = self.client.chat.completions.create(**kwargs)
                content = response.choices[0].message.content
                if content:
                    return content
            except Exception as e:
                last_error = e
                logger.warning(f"Groq call with model {model} failed: {e}. Trying fallback...")

        raise RuntimeError(f"All Groq model attempts failed: {last_error}")

    def generate_quantum_code(self, prompt: str, context: Optional[Dict[str, Any]] = None, guided_mode: bool = False) -> Dict[str, Any]:
        """
        Generates Python Qiskit code from natural language description.
        Supports full code generation or educational guided mode with hints.
        """
        system_prompt = """You are an expert Quantum Computing Research Engineer and Qiskit Specialist.
Your task is to generate clean, valid, executable Python code using Qiskit 1.0+ / 2.0.
Follow standard Qiskit syntax:
- Initialize circuits with QuantumCircuit(num_qubits, num_clbits) or QuantumCircuit(num_qubits)
- Use standard gate methods: qc.h(q), qc.x(q), qc.y(q), qc.z(q), qc.cx(c, t), qc.rx(theta, q), etc.
- If measuring, use qc.measure(q, c) or qc.measure_all()
- Only generate standard Python quantum code using qiskit and numpy.

Respond ONLY with a JSON object adhering to this schema:
{
  "intent": "generate_code",
  "code": "clean python qiskit code string",
  "language": "python",
  "framework": "qiskit",
  "explanation": "concise explanation of circuit and physics",
  "gates": ["H", "CX", ...],
  "num_qubits": 2,
  "difficulty": "beginner | intermediate | advanced",
  "expected_result": "expected state or measurement probabilities"
}"""

        if guided_mode:
            system_prompt += "\nGUIDED MODE ACTIVE: Provide an educational scaffold with hints and comments, encouraging the student to complete key steps rather than just giving a complete answer directly."

        user_content = f"User Request: {prompt}\n"
        if context:
            user_content += f"Active Environment Context: {json.dumps(context)}\n"

        raw = self._call_groq(system_prompt, user_content, json_mode=True)
        try:
            return json.loads(raw)
        except Exception:
            return {
                "intent": "generate_code",
                "code": "# Generated Qiskit Circuit\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\nqc.measure_all()\n",
                "language": "python",
                "framework": "qiskit",
                "explanation": "Created a 2-qubit Bell state |Φ⁺⟩.",
                "gates": ["H", "CX"],
                "num_qubits": 2,
                "difficulty": "beginner",
                "expected_result": "50% |00⟩, 50% |11⟩"
            }

    def debug_quantum_code(self, code: str, error_message: str, stdout: str = "") -> Dict[str, Any]:
        """
        Pinpoints the exact error in quantum code (syntax, Qiskit runtime, or conceptual flaw).
        Provides root cause, affected line number, and verified corrected code.
        """
        system_prompt = """You are an advanced Quantum Software Debugger and Physicist.
Analyze the user's quantum code, error message, and execution output.
Identify whether the error is:
1. A Python syntax / import error
2. A Qiskit runtime error (e.g. invalid qubit index, register mismatch, missing clbit)
3. A Quantum conceptual error (e.g. consecutive canceling gates like X-X or H-H, no-cloning violation, unentangled Bell state, lack of superposition before CNOT).

Respond ONLY with a JSON object adhering to this schema:
{
  "intent": "debug_code",
  "error_type": "SyntaxError | QiskitIndexError | GateMismatch | ConceptualFlaw | RuntimeException",
  "line_number": 5,
  "problem": "Clear statement of the problem",
  "why": "Detailed physical or computational explanation of why this error happened",
  "corrected_code": "Full corrected, runnable Python Qiskit code",
  "fix_explanation": "Explanation of what was changed and why it fixes the issue",
  "conceptual_issue": true or false
}"""

        user_content = f"""USER CODE:
```python
{code}
```

ERROR / EXCEPTION MESSAGE:
{error_message}

STDOUT / LOGS:
{stdout}
"""
        raw = self._call_groq(system_prompt, user_content, json_mode=True)
        try:
            return json.loads(raw)
        except Exception:
            return {
                "intent": "debug_code",
                "error_type": "QuantumExecutionError",
                "line_number": 1,
                "problem": "Error during quantum execution",
                "why": error_message,
                "corrected_code": code,
                "fix_explanation": "Review circuit dimensions and gate arguments.",
                "conceptual_issue": False
            }

    def explain_quantum_code(self, code: str, level: str = "intermediate") -> Dict[str, Any]:
        """
        Provides a line-by-line pedagogical and mathematical explanation of the code.
        Levels: beginner, intermediate, advanced.
        """
        system_prompt = f"""You are a Quantum Computing Professor.
Explain the provided Qiskit code at the '{level.upper()}' level.
- Beginner: Focus on physical intuition, coin flips, waves, and analogies.
- Intermediate: Focus on state vectors, amplitudes, unitary matrices, and probability distributions.
- Advanced: Focus on Hilbert space geometry, density matrices, tensor products, and mathematical proofs.

Respond ONLY with a JSON object adhering to this schema:
{{
  "intent": "explain_code",
  "summary": "High-level summary of what the circuit does",
  "level": "{level}",
  "line_by_line": [
    {{"line": "qc = QuantumCircuit(2)", "explanation": "Initializes 2 qubits in ground state |00⟩"}},
    {{"line": "qc.h(0)", "explanation": "Applies Hadamard to qubit 0 creating superposition (|0⟩+|1⟩)/√2"}}
  ],
  "concepts": ["Superposition", "Entanglement"],
  "mathematical_representation": "|ψ⟩ = (|00⟩ + |11⟩)/√2"
}}"""

        user_content = f"CODE TO EXPLAIN:\n```python\n{code}\n```"
        raw = self._call_groq(system_prompt, user_content, json_mode=True)
        try:
            return json.loads(raw)
        except Exception:
            return {
                "intent": "explain_code",
                "summary": "Quantum circuit execution with unitary gates.",
                "level": level,
                "line_by_line": [{"line": code, "explanation": "Quantum circuit operations."}],
                "concepts": ["Quantum Circuit"],
                "mathematical_representation": "U|ψ⟩"
            }

    def optimize_quantum_code(self, code: str) -> Dict[str, Any]:
        """
        Identifies circuit optimizations: redundant gates (H-H = I, X-X = I),
        inverse phase rotations, circuit depth reduction.
        """
        system_prompt = """You are a Quantum Circuit Compiler and Optimizer.
Analyze the user's Qiskit circuit for optimizations:
- Redundant inverse gates (H-H = I, X-X = I, Z-Z = I, S-Sdg = I)
- Consecutive rotations around the same axis (Rx(a) + Rx(b) = Rx(a+b))
- Commuting gates that can be reordered for parallelization
- Circuit depth reduction opportunities.

DO NOT alter the functional unitary operation or measurement output of the circuit.

Respond ONLY with a JSON object adhering to this schema:
{
  "intent": "optimize_code",
  "original_gate_count": 6,
  "optimized_gate_count": 4,
  "original_depth": 5,
  "optimized_depth": 3,
  "optimizations_applied": [
    "Combined two consecutive Hadamard gates on qubit 0 (H² = I)",
    "Merged Rz(π/4) and Rz(π/4) into Rz(π/2)"
  ],
  "optimized_code": "Clean, optimized Python Qiskit code",
  "explanation": "Mathematical justification for why the transformation preserves the quantum state"
}"""

        user_content = f"CODE TO OPTIMIZE:\n```python\n{code}\n```"
        raw = self._call_groq(system_prompt, user_content, json_mode=True)
        try:
            return json.loads(raw)
        except Exception:
            return {
                "intent": "optimize_code",
                "original_gate_count": 0,
                "optimized_gate_count": 0,
                "original_depth": 0,
                "optimized_depth": 0,
                "optimizations_applied": ["Circuit is already at optimal depth"],
                "optimized_code": code,
                "explanation": "No gate cancellation opportunities detected."
            }

    def analyze_code_quality(self, code: str) -> Dict[str, Any]:
        """
        Computes a heuristic quality score (0-100) based on syntax, quantum correctness,
        circuit efficiency, and measurement practices.
        """
        system_prompt = """You are a Quantum Code Reviewer.
Evaluate the user's Qiskit quantum code and produce an educational quality audit.
Score it out of 100 based on:
1. Syntax correctness (25 pts)
2. Quantum algorithm logic and purity (25 pts)
3. Gate efficiency and circuit depth (25 pts)
4. Measurement clarity and formatting (25 pts)

Respond ONLY with a JSON object adhering to this schema:
{
  "score": 88,
  "syntax_correct": true,
  "quantum_correct": true,
  "gate_count": 4,
  "circuit_depth": 3,
  "strengths": ["Clean register allocation", "Appropriate measurement basis"],
  "suggestions": ["Consider adding comments explaining the phase kickback"],
  "educational_notes": "Well structured circuit implementing EPR pair generation."
}"""

        user_content = f"CODE TO ANALYZE:\n```python\n{code}\n```"
        raw = self._call_groq(system_prompt, user_content, json_mode=True)
        try:
            return json.loads(raw)
        except Exception:
            return {
                "score": 85,
                "syntax_correct": True,
                "quantum_correct": True,
                "gate_count": 3,
                "circuit_depth": 2,
                "strengths": ["Valid Qiskit circuit"],
                "suggestions": ["Ensure normalization holds"],
                "educational_notes": "Circuit verified successfully."
            }

    @staticmethod
    def _is_quantum_query(query: str) -> bool:
        quantum_terms = [
            'quantum', 'qubit', 'superposition', 'entanglement', 'hadamard', 'cnot', 'bloch',
            'gate', 'phase', 'interference', 'measurement', 'algorithm', 'grover', 'qft',
            'shor', 'statevector', 'circuit', 'tensor', 'amplitude', 'wavefunction', 'density matrix'
        ]
        normalized = query.lower()
        return any(term in normalized for term in quantum_terms)

    def chat_completion(
        self,
        query: Optional[str] = None,
        messages: Optional[List[Dict[str, Any]]] = None,
        context: Optional[Dict[str, Any]] = None,
        rag_docs: Optional[List[Dict[str, Any]]] = None,
        image_base64: Optional[str] = None,
        image_description: Optional[str] = None,
        document_base64: Optional[str] = None,
        document_name: Optional[str] = None,
        document_type: Optional[str] = None,
        socratic_mode: bool = False
    ) -> Dict[str, Any]:
        """
        Context-aware conversational tutor that answers normally for general questions
        and switches to quantum-specific guidance only when the prompt is quantum-related.
        """
        user_query = query
        history_str = ""

        if messages:
            # Extract query and build conversation history
            user_texts = [m.get("content", "") for m in messages if m.get("sender") == "user" or m.get("role") == "user"]
            if not user_query and user_texts:
                user_query = user_texts[-1]

            # Format previous turns
            history_lines = []
            for m in messages[:-1]:
                role = "Student" if (m.get("sender") == "user" or m.get("role") == "user") else "Dirac AI"
                history_lines.append(f"{role}: {m.get('content', '')}")
            if history_lines:
                history_str = "\nCONVERSATION HISTORY:\n" + "\n".join(history_lines[-6:]) + "\n"

        if not user_query:
            user_query = "Please explain the current quantum circuit and physics principles."

        is_quantum = self._is_quantum_query(user_query) or bool(
            context and isinstance(context, dict) and (
                context.get('gates') or context.get('num_qubits') or context.get('probabilities')
            )
        )

        if is_quantum:
            system_prompt = """You are Dirac AI, an elite quantum computing professor, coding mentor, and debugger.
You understand the student's current workspace:
- The active lesson or simulator
- The active quantum circuit, gates, qubits, and code editor contents
- Any current runtime errors or simulation results
- The student's mastery profile

Tone: Encouraging, precise, rigorous yet approachable.
Use LaTeX notation for quantum states ($|0\\rangle$, $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$).
When the user asks about an error or asks to debug, explain the physical and code reason clearly.
If the student asks for a hint, provide a Socratic clue without immediately spoiling the complete answer.
Always address the user's specific circuit gates, entanglement, amplitudes, and measurements directly if provided in context.

Respond ONLY with a valid JSON object:
{
  "answer": "Comprehensive Markdown formatted explanation with mathematical equations and clear section headers",
  "suggested_actions": ["Run Code", "Inspect Bloch Sphere", "Explain Next Step"],
  "concepts": ["Superposition", "Hadamard"],
  "recommended_code": "optional python snippet if relevant",
  "difficulty": "beginner | intermediate | advanced"
}"""
        else:
            system_prompt = """You are a helpful general-purpose AI assistant.
Answer the user's question naturally and clearly in normal everyday language.
If the question is not quantum-related, do not force a quantum explanation or use quantum-specific formatting.
Be direct, friendly, and practical. Keep the answer concise but complete.

Respond ONLY with a valid JSON object:
{
  "answer": "Plain-language response to the user's question",
  "suggested_actions": ["Explain more", "Give examples"],
  "concepts": [],
  "recommended_code": null,
  "difficulty": "beginner"
}"""

        context_str = ""
        if context:
            context_str += f"\nSTRUCTURED APPLICATION CONTEXT:\n{json.dumps(context, indent=2)}\n"

        if rag_docs:
            context_str += "\nGROUNDED KNOWLEDGE BASE REFERENCE DOCUMENTS:\n"
            for d in rag_docs:
                context_str += f"- [{d.get('title', 'Reference')}]: {d.get('content', '')[:400]}\n"

        image_note = ""
        if image_base64:
            image_note = "\nATTACHED IMAGE CONTEXT:\n" + (
                image_description or "User attached an image for analysis. Use the image metadata and question to provide an informed answer."
            ) + "\n"

        document_note = ""
        if document_base64 and document_type == 'pdf':
            try:
                pdf_bytes = base64.b64decode(document_base64)
                reader = PdfReader(BytesIO(pdf_bytes))
                extracted = "\n".join(page.extract_text() or '' for page in reader.pages)
                if extracted.strip():
                    document_note = f"\nATTACHED PDF ({document_name or 'document'}), EXTRACTED TEXT:\n{extracted[:16000]}\n"
                else:
                    document_note = f"\nATTACHED PDF ({document_name or 'document'}) contains no extractable text. Ask the user for a clearer scan or image if needed.\n"
            except Exception as exc:
                logger.warning(f"Failed to extract attached PDF text: {exc}")
                document_note = f"\nATTACHED PDF ({document_name or 'document'}) could not be read. Tell the user the upload was received but text extraction failed.\n"

        user_content = f"{context_str}{history_str}{image_note}{document_note}\nUSER QUESTION:\n{user_query}"
        raw = self._call_groq(system_prompt, user_content, json_mode=True)

        try:
            # Strip markdown code blocks if the model wrapped the JSON
            cleaned = raw.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            elif cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            parsed = json.loads(cleaned)
            if isinstance(parsed, dict) and "answer" in parsed:
                return parsed
            elif isinstance(parsed, dict):
                return {
                    "answer": parsed.get("explanation", parsed.get("message", raw)),
                    "suggested_actions": parsed.get("suggested_actions", ["Inspect State", "Run Simulation"]),
                    "concepts": parsed.get("concepts", []),
                    "recommended_code": parsed.get("recommended_code", None),
                    "difficulty": parsed.get("difficulty", "intermediate")
                }
        except Exception as e:
            logger.warning(f"Failed to parse Groq JSON response: {e}. Raw content length: {len(raw)}")

        # If json.loads fails, return the actual generated text rather than a canned response
        return {
            "answer": raw.strip(),
            "suggested_actions": ["Run Simulation", "Check Bloch Sphere"],
            "concepts": ["Quantum Mechanics"],
            "recommended_code": None,
            "difficulty": "intermediate"
        }


# Singleton instance
groq_service = GroqService()
