// src/components/ai/aiService.ts
import { CircuitGate } from '../../types';
import { StateVector } from '../../quantum/statevector';
import { QuantumVectorEngine, RAGContext } from '../../quantum/rag/vectorEngine';
import { LearnerModelService } from '../../learner/learnerModel';

export type TutorMode = 'normal' | 'socratic';

export interface AIAnalysisRequest {
  userQuery: string;
  contextLessonId?: string;
  gates?: CircuitGate[];
  numQubits?: number;
  finalState?: StateVector;
  apiKey?: string;
  userLevel?: number;
  learnerMastery?: Record<string, number>;
  tutorMode?: TutorMode;
  // Multimodal attachments
  imageBase64?: string;        // base64-encoded image for vision grounding
  imageDescription?: string;   // auto or user-provided description
  attachmentType?: 'image' | 'pdf';
  attachmentName?: string;
  attachmentMimeType?: string;
}

export interface DiracResponse {
  answerMarkdown: string;
  sources: { title: string; citation: string; score: number }[];
  ragUsed: boolean;
  suggestedActions?: string[];
  concepts?: string[];
  recommendedCode?: string;
  difficulty?: string;
  isSocratic?: boolean;
}

// ─── Socratic wrapping ────────────────────────────────────────────────────────
const SOCRATIC_SYSTEM_SUFFIX = `
SOCRATIC MODE ACTIVE — You must NOT give direct answers.
Instead, guide the student to discover the answer themselves using the Socratic method:
1. Identify what the student already knows from their mastery profile.
2. Ask a precise, targeted question that exposes a conceptual gap or leads them one step forward.
3. Use analogies and Socratic probing ("What do you think happens to the amplitude when...?")
4. Provide a hint only if the student is completely stuck (express it as another question).
5. End every response with a single thought-provoking follow-up question.
NEVER state the final answer outright. Use "Can you think about why..." constructions.`;

const wrapSocratic = (answer: string, query: string): string => {
  // Extract the core answer and re-frame as Socratic guiding questions
  // Strip first-person declarations and replace with questions
  const lines = answer.split('\n').filter(l => l.trim());
  const topic = lines[0]?.replace(/^#+\s*/, '').trim() || 'this concept';
  return `### 🔍 Socratic Exploration: ${topic}

Before I guide you there — let me ask you a few things first:

**What do you already know?**
${lines.slice(1, 3).join('\n')}

**A guiding question for you:**
> ${getSocraticQuestion(query)}

**Think about this hint:**
${lines.slice(3, 6).map(l => `- ${l.replace(/^\s*[-•*]\s*/, '')}`).join('\n')}

**Now, can you form your own answer?** Once you do, share it and I'll help you check if it's correct and go deeper! 🧠

---
*💡 Tip: Socratic mode is active. I'll guide you to the answer through questions rather than stating it directly.*`;
};

const getSocraticQuestion = (query: string): string => {
  const q = query.toLowerCase();
  if (q.includes('hadamard') || q.includes('superposition'))
    return 'If a classical coin is heads-or-tails, what is fundamentally different about a qubit that allows it to be "both at once"? What mathematical object captures this?';
  if (q.includes('entangle') || q.includes('cnot'))
    return 'If I measure qubit A and instantly know qubit B\'s state, does information travel faster than light? Why or why not?';
  if (q.includes('grover'))
    return 'Classical search checks one item at a time. What property of quantum superposition lets Grover\'s algorithm check many simultaneously?';
  if (q.includes('bloch'))
    return 'The Bloch sphere has infinite points on its surface. But we can only get one bit when we measure. Where does all that extra information "go"?';
  if (q.includes('phase'))
    return 'Two waves can cancel each other out. How does quantum interference use this principle to boost the probability of the correct answer?';
  if (q.includes('fourier') || q.includes('qft'))
    return 'The classical FFT already runs in O(n log n). What is fundamentally different about what QFT does, and why does it still give a speedup?';
  if (q.includes('error') || q.includes('decoherence'))
    return 'Classical computers use redundancy (store data 3 times). Why can\'t we just copy a qubit 3 times to protect it?';
  return 'Before I explain — what is your current mental model of what\'s happening here? What part specifically confuses you?';
};

export class DiracAIService {
  public static async queryDirac(req: AIAnalysisRequest): Promise<DiracResponse> {
    // 1. RAG Vector Search
    const ragContext = QuantumVectorEngine.retrieveRAGContext(req.userQuery, 3);
    const learnerSummary = req.learnerMastery || LearnerModelService.getMasterySummary();
    const isSocratic = req.tutorMode === 'socratic';

    // 2. Primary: FastAPI Backend (Groq LLM)
    try {
      const backendRes = await this.queryBackendLLM(req, ragContext, learnerSummary, isSocratic);
      if (backendRes && backendRes.answer) {
        const answer = isSocratic ? wrapSocratic(backendRes.answer, req.userQuery) : backendRes.answer;
        return {
          answerMarkdown: answer,
          sources: ragContext.sourcesList,
          ragUsed: ragContext.sourcesList.length > 0,
          suggestedActions: isSocratic
            ? ['I think I understand — let me try to answer', 'Give me another hint', 'Switch to Normal mode']
            : backendRes.suggested_actions,
          concepts: backendRes.concepts,
          recommendedCode: backendRes.recommended_code,
          difficulty: backendRes.difficulty,
          isSocratic
        };
      }
    } catch (err) {
      console.warn('Backend Groq LLM query failed:', err);
    }

    // 3. External API key path
    if (req.apiKey && req.apiKey.trim().length > 10) {
      try {
        const extRes = await this.queryExternalLLM(req, ragContext, learnerSummary, isSocratic);
        if (extRes) {
          const answer = isSocratic ? wrapSocratic(extRes, req.userQuery) : extRes;
          return {
            answerMarkdown: answer,
            sources: ragContext.sourcesList,
            ragUsed: ragContext.sourcesList.length > 0,
            isSocratic
          };
        }
      } catch (err) {
        console.warn('External LLM failed:', err);
      }
    }

    // 4. Grounded deterministic offline fallback
    const groundedAnswer = this.generateGroundedPhysicsResponse(req, ragContext, learnerSummary);
    const finalAnswer = isSocratic ? wrapSocratic(groundedAnswer, req.userQuery) : groundedAnswer;
    return {
      answerMarkdown: finalAnswer,
      sources: ragContext.sourcesList,
      ragUsed: ragContext.sourcesList.length > 0,
      suggestedActions: isSocratic
        ? ['I think I understand — let me try to answer', 'Give me another hint']
        : undefined,
      isSocratic
    };
  }

  private static async queryBackendLLM(
    req: AIAnalysisRequest,
    rag: RAGContext,
    learnerSummary: Record<string, number>,
    isSocratic: boolean
  ): Promise<{ answer: string; suggested_actions?: string[]; concepts?: string[]; recommended_code?: string; difficulty?: string } | null> {
    try {
      const context: Record<string, any> = {
        user_level: req.userLevel || 1,
        learner_mastery: learnerSummary,
        active_lesson_id: req.contextLessonId,
        tutor_mode: req.tutorMode || 'normal',
        socratic_mode: isSocratic,
      };

      if (req.gates && req.gates.length > 0) {
        context.gates = req.gates.map(g => ({
          type: g.type, targets: g.targets, controls: g.controls, params: g.params
        }));
        context.num_qubits = req.numQubits || (Math.max(...req.gates.flatMap(g => [...g.targets, ...(g.controls || [])]), -1) + 1);
      }

      if (req.finalState) {
        try {
          context.probabilities = req.finalState.getProbabilities();
          context.entanglement_entropy = req.finalState.getEntanglementEntropy();
        } catch {}
      }

      // Multimodal: attach image description for vision grounding
      if (req.imageDescription) {
        context.image_description = req.imageDescription;
      }

      const ragDocs = rag.sourcesList.map(s => ({ title: s.title, content: s.citation }));

      const backendUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
      const response = await fetch(`${backendUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: req.userQuery,
          context,
          rag_docs: ragDocs,
          image_base64: req.imageBase64 || null,
          image_description: req.imageDescription || null,
          document_base64: req.attachmentType === 'pdf' ? req.imageBase64 || null : null,
          document_name: req.attachmentName || null,
          document_type: req.attachmentType || null,
          socratic_mode: isSocratic
        }),
        signal: AbortSignal.timeout(20000)
      });

      if (!response.ok) return null;
      const data = await response.json();
      const reply = data.reply;
      if (reply && typeof reply === 'object' && reply.answer) return reply;
      if (typeof reply === 'string') return { answer: reply };
      return null;
    } catch (e) {
      console.warn('Backend API request error:', e);
      return null;
    }
  }

  private static async queryExternalLLM(
    req: AIAnalysisRequest,
    rag: RAGContext,
    learnerSummary: Record<string, number>,
    isSocratic: boolean
  ): Promise<string | null> {
    try {
      const q = req.userQuery.toLowerCase();
      const isQuantum = /quantum|qubit|superposition|entanglement|hadamard|cnot|bloch|gate|phase|interference|measurement|circuit|algorithm|grover|qft|shor|statevector|amplitude|wavefunction|density|tensor/i.test(q);

      const systemPrompt = isQuantum ? `You are Dirac AI, a world-class theoretical physicist and empathetic quantum tutor.
Student Mastery Profile: ${JSON.stringify(learnerSummary)}.
Adapt explanation complexity to the student's mastery level.

${rag.contextPrompt}

CRITICAL: Ground your answer in the retrieved knowledge base documents above. Cite mathematical relations.
${isSocratic ? SOCRATIC_SYSTEM_SUFFIX : ''}` : `You are a helpful general-purpose AI assistant. Answer the user's question naturally in everyday language unless the prompt is clearly about quantum topics. Do not force quantum framing or jargon when the question is about general life, work, study, or other topics. Be clear, direct, and practical, and give concise but complete answers.`;

      // Multimodal: use vision model if image is attached
      const hasImage = req.imageBase64 && req.imageBase64.length > 100;
      const model = hasImage ? 'gpt-4o' : 'gpt-4o-mini';

      const userContent: any = hasImage
        ? [
            { type: 'text', text: req.userQuery },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${req.imageBase64}`, detail: 'high' } }
          ]
        : req.userQuery;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${req.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
          ],
          temperature: isSocratic ? 0.45 : 0.25
        })
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch {
      return null;
    }
  }

  private static generateGroundedPhysicsResponse(
    req: AIAnalysisRequest,
    rag: RAGContext,
    learner: Record<string, number>
  ): string {
    const q = req.userQuery.toLowerCase();
    const isQuantum = /quantum|qubit|superposition|entanglement|hadamard|cnot|bloch|gate|phase|interference|measurement|circuit|algorithm|grover|qft|shor|statevector|amplitude|wavefunction|density|tensor/i.test(q);

    if (!isQuantum) {
      const topic = req.userQuery.trim() || 'your question';
      return `### Answer

Here is a straightforward response to: **${topic}**

I’ll answer this in normal everyday language without forcing it into a quantum explanation. If you want, I can also explain it more simply, give examples, or dive deeper into the details.

**Key idea:** focus on the practical meaning, the main factors involved, and the best next step.

If you'd like, ask a follow-up and I can explain it in a simpler or more advanced way.`;
    }

    const entMastery = learner['entanglement'] || 0.5;
    const supMastery = learner['superposition'] || 0.7;

    if (q.includes('why did h create') || (q.includes('hadamard') && q.includes('superposition'))) {
      return `### Why the Hadamard Gate Creates Superposition\n\nThe Hadamard gate $H$ is a **$45^\\circ$ change of coordinate basis** in Hilbert space:\n$$H = \\frac{1}{\\sqrt{2}} \\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}$$\n\n1. **Unitary Action on $|0\\rangle$:**\n   $$H |0\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} = |+\\rangle$$\n\n2. **Bloch Sphere:** $H$ rotates by $180^\\circ$ around the $\\frac{X+Z}{\\sqrt{2}}$ axis, moving from North Pole to Equator.\n\n3. **Born's Rule:** $P(0) = P(1) = 50\\%$.\n\n*Reflection (Superposition Mastery: ${(supMastery * 100).toFixed(0)}%):* What happens if you apply $H$ to $|1\\rangle$? Why does a phase of $\\pi$ appear?`;
    }

    if (q.includes('bloch sphere mean') || (q.includes('bloch') && q.includes('mean'))) {
      return `### Physical Interpretation of the Bloch Sphere\n\nThe Bloch sphere maps any pure single-qubit state to the unit sphere $S^2$:\n$$|\\psi\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle + e^{i\\phi}\\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle$$\n\n- **North Pole ($+Z$):** $|0\\rangle$ — $P(0)=100\\%$\n- **South Pole ($-Z$):** $|1\\rangle$ — $P(1)=100\\%$\n- **Equator:** Equal superposition; $\\phi$ encodes relative phase.`;
    }

    if (q.includes('cnot create entanglement') || (q.includes('cnot') && q.includes('entangle'))) {
      return `### Why CNOT Creates Entanglement\n\n1. **Separable Input:** $|+\\rangle \\otimes |0\\rangle = \\frac{|00\\rangle + |10\\rangle}{\\sqrt{2}}$\n2. **CNOT flips target if control = $|1\\rangle$:**\n   $$\\implies |\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$$\n3. **Non-Separability:** No product state $(a|0\\rangle+b|1\\rangle)(c|0\\rangle+d|1\\rangle)$ equals $|\\Phi^+\\rangle$.\n\n*Note (Entanglement Mastery: ${(entMastery * 100).toFixed(0)}%):* The reduced density matrix for qubit 0 has purity $\\text{Tr}(\\rho_0^2) = 0.5$ — maximal entanglement!`;
    }

    if (q.includes('grover')) {
      return `### Grover's Algorithm\n\n1. **Superposition:** Equal amplitudes $+1/\\sqrt{N}$ for all $N$ states.\n2. **Oracle Phase Flip:** Marks target $|w\\rangle$ with amplitude $-1/\\sqrt{N}$.\n3. **Diffusion (Inversion about Mean):** Amplifies marked item, suppresses others.\n4. Repeat $\\approx \\frac{\\pi}{4}\\sqrt{N}$ times → $P(\\text{target}) \\approx 100\\%$.\n\nComplexity: $\\mathcal{O}(\\sqrt{N})$ vs classical $\\mathcal{O}(N)$.`;
    }

    if ((q.includes('produce this result') || q.includes('my circuit')) && req.gates && req.finalState) {
      return this.explainActiveCircuit(req.gates, req.numQubits || 2, req.finalState);
    }

    if (rag.results.length > 0) {
      const topDoc = rag.results[0].document;
      return `### Grounded Analysis: ${topDoc.title}\n\n${topDoc.content.slice(0, 550)}...\n\n**Mathematical Grounding:** All operators $U$ satisfy $U^\\dagger U = I$, ensuring $\\sum |c_i|^2 = 1$.\n\n*Socratic:* How does this relate to your active simulation?`;
    }

    return `### Dirac AI — Level ${req.userLevel || 1} Session\n\nAll quantum processes operate on linear algebra over complex Hilbert spaces. How can I guide your exploration today?`;
  }

  public static explainActiveCircuit(gates: CircuitGate[], numQubits: number, finalState: StateVector): string {
    if (gates.length === 0) return 'The circuit is empty. All qubits remain in $|0\\cdots0\\rangle$ with 100% probability.';
    const gateTypes = gates.map(g => g.type);
    const hasH = gateTypes.includes('H');
    const hasCX = gateTypes.includes('CX');
    const entropy = finalState.getEntanglementEntropy();
    let text = `### Quantum Circuit Diagnostic Analysis\n\n- **Qubits:** ${numQubits}\n- **Gates:** ${gates.length}\n- **Entanglement Entropy:** ${entropy.toFixed(3)} bits\n\n`;
    if (hasH && hasCX) text += `**Detected:** Entanglement / Bell Generator.\nHadamard creates superposition; CNOT entangles wires.\n\n`;
    else if (hasH) text += `**Detected:** Superposition & Basis Transform.\n\n`;
    text += `**Final State:** \`${finalState.toDiracString()}\`\n\nWould you like to run 1024 Monte Carlo measurement shots?`;
    return text;
  }
}
