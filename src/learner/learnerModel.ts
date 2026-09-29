// src/learner/learnerModel.ts
import { authService } from '../auth/authService';

export interface ConceptMastery {
  id: string;
  name: string;
  category: 'foundations' | 'gates' | 'core' | 'algorithms';
  score: number; // 0.0 to 1.0
  attempts: number;
  correctAttempts: number;
  consecutiveMistakes: number;
  predictionAccuracy: number;
  predictionsCount: number;
  correctPredictions: number;
  simulationInteractions: number;
  timeSpentMinutes: number;
  lastUpdated: number;
  prerequisites: string[]; // Concept IDs
  requiredPrereqScore: number;
}

export interface LearnerProfile {
  concepts: Record<string, ConceptMastery>;
  lastActiveTimestamp: number;
}

export interface RoadmapItem {
  id: string;
  name: string;
  score: number;
  status: 'mastered' | 'needs_improvement' | 'locked';
  reason?: string;
  missingPrereqs?: string[];
}

export interface ConceptualGap {
  conceptId: string;
  conceptName: string;
  severity: 'high' | 'medium' | 'low';
  score: number;
  consecutiveMistakes: number;
  gapDescription: string;
  recommendedAction: string;
  prerequisites: string[];
}

export interface RemainingStudyTopic {
  conceptId: string;
  conceptName: string;
  category: string;
  isUnlocked: boolean;
  score: number;
  missingPrereqs: string[];
  estimatedMinutes: number;
  order: number;
}

export interface AdaptiveRoadmap {
  mastered: RoadmapItem[];
  needsImprovement: RoadmapItem[];
  locked: RoadmapItem[];
  conceptualGaps: ConceptualGap[];
  whatIsLeftToStudy: RemainingStudyTopic[];
  nextRecommended: RoadmapItem | null;
  overallMasteryPercentage: number;
}

// Concept Definitions Registry
const CONCEPT_DEFINITIONS: Array<{
  id: string;
  name: string;
  category: 'foundations' | 'gates' | 'core' | 'algorithms';
  prerequisites: string[];
  requiredPrereqScore: number;
}> = [
  { id: 'bits', name: 'Classical Bits & Binary', category: 'foundations', prerequisites: [], requiredPrereqScore: 0.0 },
  { id: 'qubit', name: 'Qubits & State Vectors', category: 'foundations', prerequisites: ['bits'], requiredPrereqScore: 0.60 },
  { id: 'gates_x', name: 'Pauli-X Gate (Bit Flip)', category: 'gates', prerequisites: ['qubit'], requiredPrereqScore: 0.60 },
  { id: 'gates_h', name: 'Hadamard Gate (H)', category: 'gates', prerequisites: ['qubit'], requiredPrereqScore: 0.60 },
  { id: 'gates', name: 'Unitary Gate Transformations', category: 'gates', prerequisites: ['gates_x', 'gates_h'], requiredPrereqScore: 0.65 },
  { id: 'superposition', name: 'Superposition & Interference', category: 'core', prerequisites: ['gates_h'], requiredPrereqScore: 0.65 },
  { id: 'measurement', name: 'Born Rule & Measurement', category: 'core', prerequisites: ['qubit', 'superposition'], requiredPrereqScore: 0.65 },
  { id: 'entanglement', name: 'CNOT & Bell Entanglement', category: 'core', prerequisites: ['gates_h', 'superposition'], requiredPrereqScore: 0.65 },
  { id: 'phase', name: 'Phase & Quantum Interference', category: 'core', prerequisites: ['gates_h', 'superposition'], requiredPrereqScore: 0.65 },
  { id: 'bloch', name: 'Bloch Sphere & 3D Polar Rotations', category: 'gates', prerequisites: ['qubit'], requiredPrereqScore: 0.60 },
  { id: 'grover', name: "Grover's Search Algorithm", category: 'algorithms', prerequisites: ['superposition', 'gates', 'measurement'], requiredPrereqScore: 0.65 },
  { id: 'qft', name: 'Quantum Fourier Transform', category: 'algorithms', prerequisites: ['gates', 'superposition'], requiredPrereqScore: 0.70 },
  { id: 'shor', name: "Shor's Factoring Algorithm", category: 'algorithms', prerequisites: ['qft', 'entanglement'], requiredPrereqScore: 0.70 },
  { id: 'teleportation', name: 'Quantum Teleportation & EPR Channel', category: 'core', prerequisites: ['entanglement', 'measurement'], requiredPrereqScore: 0.65 },
  { id: 'error_correction', name: 'Decoherence & Quantum Error Correction', category: 'algorithms', prerequisites: ['entanglement', 'gates'], requiredPrereqScore: 0.65 },
  { id: 'hardware', name: 'Transmon QPU Hardware & Cryogenics', category: 'foundations', prerequisites: ['qubit'], requiredPrereqScore: 0.60 }
];

export function createZeroConcepts(): Record<string, ConceptMastery> {
  const map: Record<string, ConceptMastery> = {};
  CONCEPT_DEFINITIONS.forEach(def => {
    map[def.id] = {
      id: def.id,
      name: def.name,
      category: def.category,
      score: 0.0,
      attempts: 0,
      correctAttempts: 0,
      consecutiveMistakes: 0,
      predictionAccuracy: 0.0,
      predictionsCount: 0,
      correctPredictions: 0,
      simulationInteractions: 0,
      timeSpentMinutes: 0,
      lastUpdated: Date.now(),
      prerequisites: def.prerequisites,
      requiredPrereqScore: def.requiredPrereqScore
    };
  });
  return map;
}

export const INITIAL_CONCEPTS: Record<string, ConceptMastery> = createZeroConcepts();

const STORAGE_KEY = 'quantumlearn_learner_profile_v1';

export class LearnerModelService {
  private static profile: LearnerProfile = this.loadProfile();
  private static listeners: Set<() => void> = new Set();

  private static loadProfile(): LearnerProfile {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const zero = createZeroConcepts();
        const mergedConcepts: Record<string, ConceptMastery> = {};
        Object.keys(zero).forEach(id => {
          if (parsed.concepts && parsed.concepts[id]) {
            mergedConcepts[id] = { ...zero[id], ...parsed.concepts[id] };
          } else {
            mergedConcepts[id] = { ...zero[id] };
          }
        });
        return {
          concepts: mergedConcepts,
          lastActiveTimestamp: parsed.lastActiveTimestamp || Date.now()
        };
      }
    } catch {
      // Fallback
    }

    return {
      concepts: createZeroConcepts(),
      lastActiveTimestamp: Date.now()
    };
  }

  private static saveProfile(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
      // Persist to SQLite backend if logged in
      const summary = this.getMasterySummary();
      authService.updateProgress({ conceptMastery: summary }).catch(() => {});
    } catch {
      // ignore
    }
    this.listeners.forEach(fn => fn());
  }

  public static resetToZero(): void {
    this.profile = {
      concepts: createZeroConcepts(),
      lastActiveTimestamp: Date.now()
    };
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    this.listeners.forEach(fn => fn());
  }

  public static resetProfile(): void {
    this.resetToZero();
  }

  public static syncWithBackendProgress(conceptMasteryMap?: Record<string, number>): void {
    if (!conceptMasteryMap || Object.keys(conceptMasteryMap).length === 0) {
      // If user has no concept mastery stored, initialize zero concepts
      this.profile.concepts = createZeroConcepts();
    } else {
      const zero = createZeroConcepts();
      Object.entries(conceptMasteryMap).forEach(([id, score]) => {
        if (zero[id]) {
          zero[id].score = Math.max(0.0, Math.min(1.0, score));
          if (score > 0) {
            zero[id].attempts = Math.max(1, zero[id].attempts);
            zero[id].correctAttempts = Math.max(1, zero[id].correctAttempts);
          }
        }
      });
      this.profile.concepts = zero;
    }
    this.saveProfile();
  }

  public static subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public static getProfile(): LearnerProfile {
    return this.profile;
  }

  public static getConcept(id: string): ConceptMastery | undefined {
    return this.profile.concepts[id];
  }

  public static getMasterySummary(): Record<string, number> {
    const summary: Record<string, number> = {};
    Object.entries(this.profile.concepts).forEach(([id, c]) => {
      summary[id] = Number(c.score.toFixed(2));
    });
    return summary;
  }

  // --- Rolling Performance Update Algorithms ---
  public static recordQuizAttempt(conceptId: string, isCorrect: boolean): void {
    let c = this.profile.concepts[conceptId];
    if (!c) {
      const zero = createZeroConcepts();
      if (!zero[conceptId]) return;
      c = zero[conceptId];
      this.profile.concepts[conceptId] = c;
    }

    c.attempts += 1;
    if (isCorrect) {
      c.correctAttempts += 1;
      c.consecutiveMistakes = 0;
      c.score = Number(((1 - 0.25) * c.score + 0.25 * 0.95).toFixed(3));
    } else {
      c.consecutiveMistakes += 1;
      const penaltyWeight = Math.min(0.35, 0.20 + c.consecutiveMistakes * 0.05);
      c.score = Number(((1 - penaltyWeight) * c.score + penaltyWeight * 0.15).toFixed(3));
    }

    c.score = Math.max(0.0, Math.min(0.99, c.score));
    c.lastUpdated = Date.now();
    this.saveProfile();
  }

  public static recordPredictionAttempt(conceptId: string, isCorrect: boolean): void {
    let c = this.profile.concepts[conceptId];
    if (!c) {
      const zero = createZeroConcepts();
      if (!zero[conceptId]) return;
      c = zero[conceptId];
      this.profile.concepts[conceptId] = c;
    }

    c.predictionsCount += 1;
    if (isCorrect) c.correctPredictions += 1;
    c.predictionAccuracy = Number((c.correctPredictions / c.predictionsCount).toFixed(2));

    const target = isCorrect ? 0.90 : 0.30;
    c.score = Number(((1 - 0.20) * c.score + 0.20 * target).toFixed(3));
    c.score = Math.max(0.0, Math.min(0.99, c.score));
    c.lastUpdated = Date.now();
    this.saveProfile();
  }

  public static recordSimulationInteraction(conceptId: string): void {
    let c = this.profile.concepts[conceptId];
    if (!c) {
      const zero = createZeroConcepts();
      if (!zero[conceptId]) return;
      c = zero[conceptId];
      this.profile.concepts[conceptId] = c;
    }

    c.simulationInteractions += 1;
    if (c.score < 0.90) {
      c.score = Number(Math.min(0.90, c.score + 0.05).toFixed(3));
    }
    c.lastUpdated = Date.now();
    this.saveProfile();
  }

  // --- Dynamic Adaptive Roadmap Generator ---
  public static computeAdaptiveRoadmap(): AdaptiveRoadmap {
    const concepts = Object.values(this.profile.concepts);

    const mastered: RoadmapItem[] = [];
    const needsImprovement: RoadmapItem[] = [];
    const locked: RoadmapItem[] = [];
    const conceptualGaps: ConceptualGap[] = [];
    const whatIsLeftToStudy: RemainingStudyTopic[] = [];

    let totalScoreSum = 0;

    concepts.forEach((c, index) => {
      totalScoreSum += c.score;

      // Check prerequisites
      const missingPrereqs: string[] = [];
      c.prerequisites.forEach(preId => {
        const preConcept = this.profile.concepts[preId];
        if (!preConcept || preConcept.score < c.requiredPrereqScore) {
          missingPrereqs.push(preConcept?.name || preId);
        }
      });

      const isUnlocked = missingPrereqs.length === 0;

      if (c.score >= 0.75) {
        mastered.push({
          id: c.id,
          name: c.name,
          score: Math.round(c.score * 100),
          status: 'mastered'
        });
      } else if (!isUnlocked) {
        locked.push({
          id: c.id,
          name: c.name,
          score: Math.round(c.score * 100),
          status: 'locked',
          reason: `Requires mastery in: ${missingPrereqs.join(', ')}`,
          missingPrereqs
        });

        whatIsLeftToStudy.push({
          conceptId: c.id,
          conceptName: c.name,
          category: c.category,
          isUnlocked: false,
          score: Math.round(c.score * 100),
          missingPrereqs,
          estimatedMinutes: 25,
          order: index + 1
        });
      } else {
        needsImprovement.push({
          id: c.id,
          name: c.name,
          score: Math.round(c.score * 100),
          status: 'needs_improvement',
          reason: c.score === 0 ? 'Not started yet' : `Current score is ${Math.round(c.score * 100)}%. Needs practice.`
        });

        if (c.score < 0.65) {
          const severity = c.consecutiveMistakes >= 2 ? 'high' : c.score < 0.35 ? 'medium' : 'low';
          conceptualGaps.push({
            conceptId: c.id,
            conceptName: c.name,
            severity,
            score: Math.round(c.score * 100),
            consecutiveMistakes: c.consecutiveMistakes,
            gapDescription: c.score === 0
              ? `Topic "${c.name}" has not been studied yet.`
              : `Scoring ${Math.round(c.score * 100)}% with ${c.consecutiveMistakes} mistakes in recent quizzes.`,
            recommendedAction: `Review topic notes in Curriculum and complete targeted practice quiz.`,
            prerequisites: c.prerequisites
          });
        }

        whatIsLeftToStudy.push({
          conceptId: c.id,
          conceptName: c.name,
          category: c.category,
          isUnlocked: true,
          score: Math.round(c.score * 100),
          missingPrereqs: [],
          estimatedMinutes: 20,
          order: index + 1
        });
      }
    });

    const overallMasteryPercentage = concepts.length > 0
      ? Math.round((totalScoreSum / concepts.length) * 100)
      : 0;

    const nextRecommended = needsImprovement[0] || locked[0] || null;

    return {
      mastered,
      needsImprovement,
      locked,
      conceptualGaps,
      whatIsLeftToStudy,
      nextRecommended,
      overallMasteryPercentage
    };
  }

  public static generateRoadmap(): AdaptiveRoadmap {
    return this.computeAdaptiveRoadmap();
  }
}
