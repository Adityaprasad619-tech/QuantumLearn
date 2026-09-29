# backend/sandbox_executor.py
"""
QuantumLearn - Sandboxed Quantum Code Execution Engine
Provides secure AST pre-validation, isolated process execution with timeout,
traceback line extraction, and circuit state/Bloch vector extraction.
"""

import ast
import sys
import io
import math
import traceback
import subprocess
import tempfile
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np

DISALLOWED_MODULES = {
    "os", "sys", "subprocess", "shutil", "socket", "urllib", "requests",
    "http", "ftplib", "smtplib", "telnetlib", "posix", "nt", "pty",
    "ctypes", "winreg", "msvcrt", "platform", "signal", "multiprocessing",
    "threading", "asyncio", "pathlib", "glob", "tempfile"
}

DISALLOWED_FUNCTIONS = {
    "open", "eval", "exec", "compile", "__import__", "globals", "locals",
    "input", "breakpoint", "memoryview", "getattr", "setattr", "delattr"
}


class SecurityCheckError(Exception):
    def __init__(self, message: str, line_number: Optional[int] = None):
        super().__init__(message)
        self.line_number = line_number


def validate_python_code_ast(code: str):
    """
    Statically analyzes code AST to enforce sandbox security before execution.
    """
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        raise SecurityCheckError(f"SyntaxError: {e.msg}", line_number=e.lineno)

    for node in ast.walk(tree):
        # Disallow dangerous imports
        if isinstance(node, ast.Import):
            for alias in node.names:
                mod_root = alias.name.split('.')[0]
                if mod_root in DISALLOWED_MODULES:
                    raise SecurityCheckError(f"Security Policy: Module '{mod_root}' is forbidden in quantum sandbox.", line_number=node.lineno)

        elif isinstance(node, ast.ImportFrom):
            if node.module:
                mod_root = node.module.split('.')[0]
                if mod_root in DISALLOWED_MODULES:
                    raise SecurityCheckError(f"Security Policy: Importing from '{mod_root}' is forbidden in quantum sandbox.", line_number=node.lineno)

        # Disallow dangerous builtins
        elif isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id in DISALLOWED_FUNCTIONS:
                raise SecurityCheckError(f"Security Policy: Function '{node.func.id}' is forbidden.", line_number=node.lineno)


RUNNER_TEMPLATE = r"""
import sys
import json
import numpy as np
import math

try:
    import qiskit
    from qiskit import QuantumCircuit
    from qiskit.quantum_info import Statevector, partial_trace
except Exception as e:
    print(json.dumps({"error": f"Qiskit import error: {str(e)}", "success": False}))
    sys.exit(0)

# --- USER CODE BEGIN ---
{USER_CODE}
# --- USER CODE END ---

# Find the QuantumCircuit in global scope
circuit = None
for var_name in ['qc', 'circuit', 'circ']:
    if var_name in locals() and isinstance(locals()[var_name], QuantumCircuit):
        circuit = locals()[var_name]
        break

if circuit is None:
    for val in locals().values():
        if isinstance(val, QuantumCircuit):
            circuit = val
            break

if circuit is None:
    # Code executed without creating a circuit
    output = {
        "success": True,
        "circuit_found": False,
        "num_qubits": 0,
        "gates": [],
        "state_vector": [],
        "probabilities": {},
        "bloch_vectors": []
    }
    print("___QC_RESULT_START___")
    print(json.dumps(output))
    sys.exit(0)

num_qubits = circuit.num_qubits
num_clbits = circuit.num_clbits

# Extract gates
gates_list = []
for instruction in circuit.data:
    op = instruction.operation
    name = op.name.upper()
    
    # Map qiskit targets and controls
    q_indices = [circuit.find_bit(q).index for q in instruction.qubits]
    
    params = {}
    if hasattr(op, 'params') and op.params:
        try:
            params = {f"p{i}": float(p) for i, p in enumerate(op.params) if isinstance(p, (int, float))}
        except Exception:
            params = {}

    if name == 'CX':
        gates_list.append({
            "type": "CX",
            "controls": [q_indices[0]],
            "targets": [q_indices[1]],
            "params": params
        })
    elif name == 'CCX':
        gates_list.append({
            "type": "CCX",
            "controls": [q_indices[0], q_indices[1]],
            "targets": [q_indices[2]],
            "params": params
        })
    elif name == 'CZ':
        gates_list.append({
            "type": "CZ",
            "controls": [q_indices[0]],
            "targets": [q_indices[1]],
            "params": params
        })
    elif name in ['MEASURE']:
        gates_list.append({
            "type": "MEASURE",
            "targets": q_indices,
            "controls": [],
            "params": params
        })
    else:
        gates_list.append({
            "type": name,
            "targets": q_indices,
            "controls": [],
            "params": params
        })

# Compute exact statevector (remove measurement gates for state calculation if needed)
try:
    circ_no_meas = circuit.remove_final_measurements(inplace=False) if hasattr(circuit, 'remove_final_measurements') else circuit
    # Only keep unitary operations for statevector
    meas_free = QuantumCircuit(circuit.num_qubits)
    for inst in circuit.data:
        if inst.operation.name not in ['measure', 'reset', 'barrier']:
            meas_free.append(inst)
    
    sv = Statevector.from_instruction(meas_free)
    raw_vec = sv.data
    dim = len(raw_vec)

    state_vector = [{"re": round(float(c.real), 5), "im": round(float(c.imag), 5)} for c in raw_vec]
    probs_dict = {format(i, f'0{num_qubits}b'): round(float(abs(raw_vec[i])**2), 5) for i in range(dim)}

    # Compute Bloch vector for each single qubit
    bloch_vectors = []
    for q in range(num_qubits):
        if num_qubits == 1:
            rho = np.outer(raw_vec, np.conj(raw_vec))
        else:
            other_qubits = [i for i in range(num_qubits) if i != q]
            rho = partial_trace(sv, other_qubits).data
        
        rx = float(2 * rho[0, 1].real)
        ry = float(2 * rho[1, 0].imag)
        rz = float(rho[0, 0].real - rho[1, 1].real)
        bloch_vectors.append({
            "qubit": q,
            "x": round(rx, 4),
            "y": round(ry, 4),
            "z": round(rz, 4)
        })

except Exception as ex:
    state_vector = []
    probs_dict = {}
    bloch_vectors = []

counts = {}
try:
    if probs_dict:
        keys = list(probs_dict.keys())
        p_vals = np.array([probs_dict[k] for k in keys], dtype=float)
        p_sum = np.sum(p_vals)
        if p_sum > 0:
            p_vals = p_vals / p_sum
            sampled = np.random.choice(len(keys), size=1024, p=p_vals)
            counts = {keys[i]: int(np.sum(sampled == i)) for i in range(len(keys)) if np.sum(sampled == i) > 0}
except Exception:
    counts = {}

output = {
    "success": True,
    "circuit_found": True,
    "num_qubits": num_qubits,
    "num_clbits": num_clbits,
    "gate_count": len(circuit.data),
    "depth": circuit.depth() if hasattr(circuit, 'depth') else len(circuit.data),
    "gates": gates_list,
    "state_vector": state_vector,
    "probabilities": probs_dict,
    "counts": counts,
    "bloch_vectors": bloch_vectors
}

print("___QC_RESULT_START___")
print(json.dumps(output))
"""


def execute_quantum_sandbox(code: str, timeout_sec: int = 5, timeout_seconds: Optional[int] = None, shots: int = 1024) -> Dict[str, Any]:
    """
    Runs quantum Python code inside an isolated subprocess with security checks.
    """
    actual_timeout = timeout_seconds if timeout_seconds is not None else timeout_sec
    # 1. AST Security Analysis
    try:
        validate_python_code_ast(code)
    except SecurityCheckError as sec_err:
        return {
            "success": False,
            "error_type": "SecurityPolicyViolation",
            "line_number": sec_err.line_number or 1,
            "message": str(sec_err),
            "stdout": "",
            "stderr": str(sec_err)
        }
    except Exception as ast_err:
        return {
            "success": False,
            "error_type": "SyntaxError",
            "line_number": 1,
            "message": str(ast_err),
            "stdout": "",
            "stderr": str(ast_err)
        }

    # 2. Prepare Sandboxed Script
    header_part = RUNNER_TEMPLATE.split("{USER_CODE}")[0]
    header_offset_lines = len(header_part.splitlines())

    script_content = RUNNER_TEMPLATE.replace("{USER_CODE}", code)

    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False, encoding="utf-8") as tf:
        tf.write(script_content)
        temp_path = tf.name

    try:
        proc = subprocess.run(
            [sys.executable, temp_path],
            capture_output=True,
            text=True,
            timeout=actual_timeout
        )

        stdout_raw = proc.stdout
        stderr_raw = proc.stderr

        # Check for runtime crash
        if proc.returncode != 0:
            # Extract line number from traceback targeting temp_path specifically
            line_num = None
            lines = stderr_raw.splitlines()
            for line in lines:
                if temp_path in line or (Path(temp_path).name in line and "line " in line):
                    try:
                        part = line.split("line ")[1].split(",")[0].strip()
                        raw_line = int(part)
                        # Offset to match user code line
                        calc_line = raw_line - header_offset_lines
                        if calc_line > 0:
                            line_num = calc_line
                    except Exception:
                        pass

            # Filter traceback to present clean message
            clean_error = stderr_raw.strip()
            if "Traceback" in clean_error:
                clean_error = clean_error.split("\n")[-1]

            return {
                "success": False,
                "error_type": "RuntimeError",
                "line_number": line_num or 1,
                "message": clean_error or "Quantum execution failed.",
                "stdout": stdout_raw,
                "stderr": stderr_raw
            }

        # Parse the structured circuit output marker
        if "___QC_RESULT_START___" in stdout_raw:
            parts = stdout_raw.split("___QC_RESULT_START___")
            user_stdout = parts[0].strip()
            json_str = parts[1].strip()
            qc_data = json.loads(json_str)
            qc_data["stdout"] = user_stdout
            qc_data["stderr"] = stderr_raw
            return qc_data
        else:
            return {
                "success": True,
                "circuit_found": False,
                "stdout": stdout_raw,
                "stderr": stderr_raw,
                "num_qubits": 0,
                "gates": [],
                "state_vector": [],
                "probabilities": {},
                "bloch_vectors": []
            }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error_type": "TimeoutError",
            "line_number": 1,
            "message": f"Execution timed out ({timeout_sec}s limit exceeded). Check for infinite loops.",
            "stdout": "",
            "stderr": "TimeoutExpired"
        }
    except Exception as ex:
        return {
            "success": False,
            "error_type": "ExecutionError",
            "line_number": 1,
            "message": str(ex),
            "stdout": "",
            "stderr": traceback.format_exc()
        }
    finally:
        try:
            Path(temp_path).unlink(missing_ok=True)
        except Exception:
            pass
