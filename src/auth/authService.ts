// src/auth/authService.ts
/**
 * QuantumLearn Authentication & SQLite Dynamic Storage Bridge.
 * Communicates directly with the FastAPI backend (:8000) for SQLite persistence,
 * with local cache resilience for high availability.
 * Designed for effortless transition to Supabase (PostgreSQL).
 */

export type UserRole = 'student' | 'researcher' | 'teacher';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: number;
  // Researcher / Educator specific
  institution?: string;
  fieldOfStudy?: string;
  subject?: string;
  // Student specific
  grade?: string;
  enrolledCourses?: string[];
  progress?: LiveUserProgress;
}

export interface LiveUserProgress {
  userId: string;
  xp: number;
  level: number;
  streakDays: number;
  completedLessons: string[];
  completedChallenges: string[];
  conceptMastery: Record<string, number>;
  updatedAt?: number;
}

export interface SavedCircuitItem {
  id: string;
  userId: string;
  name: string;
  description?: string;
  numQubits: number;
  gates: any[];
  createdAt?: number;
}

export interface ResearchExperimentItem {
  id: string;
  userId: string;
  title: string;
  experimentType: string;
  description?: string;
  qubitCount: number;
  circuit: any[];
  metrics: Record<string, any>;
  status: string;
  createdAt?: number;
}

export interface CohortTelemetry {
  totalStudents: number;
  avgXp: number;
  avgStreak: number;
  avgLessonsCompleted: number;
  studentsList: Array<{
    id: string;
    name: string;
    email: string;
    institution: string;
    grade: string;
    fieldOfStudy: string;
    xp: number;
    level: number;
    streakDays: number;
    completedLessonsCount: number;
    completedChallengesCount: number;
    completedLessons: string[];
    createdAt?: number;
  }>;
  conceptHeatmap: Record<string, number>;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  progress?: LiveUserProgress;
  token?: string;
  error?: string;
}

const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const TOKEN_KEY = 'qc_token';
const SESSION_KEY = 'qc_session';

export const authService = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getSession(): AuthUser | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setSession(user: AuthUser, token?: string): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      }
    } catch (e) {
      console.warn('Failed to persist session to localStorage', e);
    }
  },

  logout(): void {
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Error clearing session', e);
    }
  },

  /**
   * User Signup into SQLite Database
   */
  async signup(
    name: string,
    email: string,
    password: string,
    role: UserRole,
    extra?: {
      institution?: string;
      grade?: string;
      fieldOfStudy?: string;
    }
  ): Promise<AuthResult> {
    const normalizedRole = role === 'teacher' ? 'researcher' : role;

    try {
      this.logout();
      const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role: normalizedRole,
          institution: extra?.institution,
          grade: extra?.grade,
          field_of_study: extra?.fieldOfStudy,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Signup failed. Please try again.',
        };
      }

      const user: AuthUser = {
        ...data.user,
        role: data.user.role as UserRole,
      };

      this.setSession(user, data.access_token);
      return {
        success: true,
        user,
        progress: data.progress,
        token: data.access_token,
      };
    } catch {
      return {
        success: false,
        error: 'Unable to connect to backend server. Please verify the backend is running.',
      };
    }
  },

  /**
   * User Login verifying against SQLite Database
   */
  async login(email: string, password: string, role?: UserRole): Promise<AuthResult> {
    const normalizedRole = role === 'teacher' ? 'researcher' : role;

    try {
      this.logout();
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          role: normalizedRole,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Invalid email or password.',
        };
      }

      const user: AuthUser = {
        ...data.user,
        role: data.user.role as UserRole,
      };

      this.setSession(user, data.access_token);
      return {
        success: true,
        user,
        progress: data.progress,
        token: data.access_token,
      };
    } catch {
      return {
        success: false,
        error: 'Unable to connect to authentication server. Please check backend status.',
      };
    }
  },

  /**
   * Verify session token and retrieve fresh user profile & progress from SQLite
   */
  async getProfile(): Promise<{ user: AuthUser | null; progress: LiveUserProgress | null }> {
    const token = this.getToken();
    if (!token) return { user: this.getSession(), progress: null };

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const user: AuthUser = { ...data.user, role: data.user.role as UserRole };
        this.setSession(user);
        return { user, progress: data.progress };
      }
    } catch {
      // Return cached session on offline
    }
    return { user: this.getSession(), progress: null };
  },

  /**
   * Fetch Live Learner Progress from SQLite
   */
  async getLearnerProgress(): Promise<LiveUserProgress> {
    const token = this.getToken();
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BACKEND_URL}/api/learner/progress`, { headers });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to fetch live progress', e);
    }

    // Clean slate zero fallback for new / unauthenticated users
    return {
      userId: 'usr_guest',
      xp: 0,
      level: 1,
      streakDays: 0,
      completedLessons: [],
      completedChallenges: [],
      conceptMastery: {},
    };
  },

  /**
   * Sync Full Dynamic Learner Progress State into SQLite Backend
   */
  async updateProgress(payload: {
    xp?: number;
    level?: number;
    streakDays?: number;
    completedLessons?: string[];
    completedChallenges?: string[];
    conceptMastery?: Record<string, number>;
  }): Promise<LiveUserProgress | null> {
    const token = this.getToken();
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BACKEND_URL}/api/learner/progress/update`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          xp: payload.xp,
          level: payload.level,
          streak_days: payload.streakDays,
          completed_lessons: payload.completedLessons,
          completed_challenges: payload.completedChallenges,
          concept_mastery: payload.conceptMastery,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.progress;
      }
    } catch (e) {
      console.warn('Failed to update progress in SQLite', e);
    }
    return null;
  },


  /**
   * Record Lesson Completion into SQLite
   */
  async recordLessonComplete(lessonId: string, xpGain: number = 50): Promise<LiveUserProgress | null> {
    const token = this.getToken();
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BACKEND_URL}/api/learner/progress/lesson`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ lesson_id: lessonId, xp_gain: xpGain }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.progress;
      }
    } catch (e) {
      console.warn('Failed to record lesson completion', e);
    }
    return null;
  },

  /**
   * Record Challenge Completion into SQLite
   */
  async recordChallengeComplete(challengeId: string, xpGain: number = 100): Promise<LiveUserProgress | null> {
    const token = this.getToken();
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BACKEND_URL}/api/learner/progress/challenge`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ challenge_id: challengeId, xp_gain: xpGain }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.progress;
      }
    } catch (e) {
      console.warn('Failed to record challenge completion', e);
    }
    return null;
  },

  /**
   * Get Saved Circuits from SQLite
   */
  async getSavedCircuits(): Promise<SavedCircuitItem[]> {
    const token = this.getToken();
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BACKEND_URL}/api/circuits`, { headers });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to load saved circuits', e);
    }
    return [];
  },

  /**
   * Save Circuit to SQLite
   */
  async saveCircuit(name: string, description: string, numQubits: number, gates: any[]): Promise<SavedCircuitItem | null> {
    const token = this.getToken();
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BACKEND_URL}/api/circuits`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, description, num_qubits: numQubits, gates }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.circuit;
      }
    } catch (e) {
      console.warn('Failed to save circuit', e);
    }
    return null;
  },

  /**
   * Delete Saved Circuit from SQLite
   */
  async deleteCircuit(circuitId: string): Promise<boolean> {
    const token = this.getToken();
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BACKEND_URL}/api/circuits/${circuitId}`, {
        method: 'DELETE',
        headers,
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Get Quantum Research Experiments from SQLite
   */
  async getResearchExperiments(): Promise<ResearchExperimentItem[]> {
    const token = this.getToken();
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BACKEND_URL}/api/research/experiments`, { headers });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to load experiments', e);
    }
    return [];
  },

  /**
   * Run and Persist Quantum Research Experiment into SQLite
   */
  async runResearchExperiment(payload: {
    title: string;
    experimentType: string;
    description?: string;
    qubitCount: number;
    circuit?: any[];
    metrics?: Record<string, any>;
  }): Promise<ResearchExperimentItem | null> {
    const token = this.getToken();
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BACKEND_URL}/api/research/experiments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: payload.title,
          experiment_type: payload.experimentType,
          description: payload.description,
          qubit_count: payload.qubitCount,
          circuit: payload.circuit,
          metrics: payload.metrics,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.experiment;
      }
    } catch (e) {
      console.warn('Failed to run research experiment', e);
    }
    return null;
  },

  /**
   * Delete Research Experiment from SQLite
   */
  async deleteResearchExperiment(id: string): Promise<boolean> {
    const token = this.getToken();
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BACKEND_URL}/api/research/experiments/${id}`, {
        method: 'DELETE',
        headers,
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Get Student Cohort Analytics for Researcher from SQLite
   */
  async getCohortTelemetry(): Promise<CohortTelemetry | null> {
    const token = this.getToken();
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BACKEND_URL}/api/research/cohort`, { headers });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to fetch cohort telemetry', e);
    }
    return null;
  },

  /**
   * Get QPU Hardware Benchmarks from SQLite
   */
  async getHardwareBenchmarks(): Promise<any[]> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/research/benchmarks`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to load benchmarks', e);
    }
    return [];
  },

  // Legacy helper methods for backward compatibility
  getAllStudents(): AuthUser[] {
    return [
      {
        id: 'usr_student_alex',
        name: 'Alex Rivera',
        email: 'student@quantumlearn.edu',
        role: 'student',
        grade: 'Undergraduate Physics (Year 3)',
      },
      {
        id: 'usr_student_maya',
        name: 'Maya Lin',
        email: 'maya@quantumlearn.edu',
        role: 'student',
        grade: 'Senior CS & Quantum Computing',
      },
    ];
  },
};
