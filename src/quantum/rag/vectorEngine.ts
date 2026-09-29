// src/quantum/rag/vectorEngine.ts
import { KnowledgeDocument, QUANTUM_KNOWLEDGE_BASE } from './knowledgeBase';

export interface SearchResult {
  document: KnowledgeDocument;
  score: number; // 0.0 to 1.0
  matchPercentage: number; // e.g. 92%
  snippet: string;
}

export interface RAGContext {
  query: string;
  results: SearchResult[];
  contextPrompt: string;
  sourcesList: { title: string; citation: string; score: number }[];
}

export class QuantumVectorEngine {
  private static vocabulary: Map<string, number> = new Map();
  private static idfWeights: Map<string, number> = new Map();
  private static documentVectors: Map<string, number[]> = new Map();
  private static isIndexed: boolean = false;

  private static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s\+\-\*\/]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1);
  }

  public static initializeIndex(): void {
    if (this.isIndexed) return;

    const docs = QUANTUM_KNOWLEDGE_BASE;
    const docTokensMap = new Map<string, string[]>();
    const docFrequency = new Map<string, number>();

    // 1. Build vocabulary and document frequencies
    docs.forEach(doc => {
      const allText = `${doc.title} ${doc.keywords.join(' ')} ${doc.content}`;
      const tokens = this.tokenize(allText);
      docTokensMap.set(doc.id, tokens);

      const uniqueTokensInDoc = new Set(tokens);
      uniqueTokensInDoc.forEach(tok => {
        docFrequency.set(tok, (docFrequency.get(tok) || 0) + 1);
        if (!this.vocabulary.has(tok)) {
          this.vocabulary.set(tok, this.vocabulary.size);
        }
      });
    });

    // 2. Compute IDF weights: idf = log(1 + N / df)
    const N = docs.length;
    docFrequency.forEach((df, tok) => {
      this.idfWeights.set(tok, Math.log(1 + N / df));
    });

    // 3. Build normalized TF-IDF embedding vectors for each document
    docs.forEach(doc => {
      const tokens = docTokensMap.get(doc.id) || [];
      const vec = this.computeVector(tokens, doc.keywords);
      this.documentVectors.set(doc.id, vec);
    });

    this.isIndexed = true;
  }

  private static computeVector(tokens: string[], boostKeywords?: string[]): number[] {
    const vec = new Array(this.vocabulary.size).fill(0);
    const tf = new Map<string, number>();

    tokens.forEach(tok => {
      tf.set(tok, (tf.get(tok) || 0) + 1);
    });

    tf.forEach((count, tok) => {
      const idx = this.vocabulary.get(tok);
      if (idx !== undefined) {
        const idf = this.idfWeights.get(tok) || 1;
        let weight = (count / tokens.length) * idf;

        // Keyword boost
        if (boostKeywords && boostKeywords.includes(tok)) {
          weight *= 2.5;
        }

        vec[idx] = weight;
      }
    });

    // Normalize to unit length
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    if (norm > 0) {
      for (let i = 0; i < vec.length; i++) {
        vec[i] /= norm;
      }
    }

    return vec;
  }

  private static cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dot = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
    }
    return Math.max(0, Math.min(1, dot));
  }

  public static search(query: string, topK: number = 3): SearchResult[] {
    this.initializeIndex();

    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return [];

    const queryVec = this.computeVector(queryTokens);
    const scoredDocs: SearchResult[] = [];

    QUANTUM_KNOWLEDGE_BASE.forEach(doc => {
      const docVec = this.documentVectors.get(doc.id);
      if (!docVec) return;

      let score = this.cosineSimilarity(queryVec, docVec);

      // Boost score if title or keywords explicitly match query tokens
      const queryLower = query.toLowerCase();
      doc.keywords.forEach(kw => {
        if (queryLower.includes(kw.toLowerCase())) {
          score = Math.min(1.0, score + 0.12);
        }
      });

      if (score > 0.05) {
        // Generate relevant snippet
        const sentences = doc.content.split('\n');
        const bestSentence = sentences.find(s =>
          queryTokens.some(t => s.toLowerCase().includes(t))
        ) || sentences[0];

        scoredDocs.push({
          document: doc,
          score,
          matchPercentage: Math.round(score * 100),
          snippet: bestSentence.trim().slice(0, 180) + '...'
        });
      }
    });

    // Sort descending by similarity score
    scoredDocs.sort((a, b) => b.score - a.score);
    return scoredDocs.slice(0, topK);
  }

  public static retrieveRAGContext(query: string, topK: number = 3): RAGContext {
    const results = this.search(query, topK);

    let contextPrompt = '';
    const sourcesList: { title: string; citation: string; score: number }[] = [];

    if (results.length > 0) {
      contextPrompt = 'GROUNDED KNOWLEDGE BASE CONTEXT (Prioritize this information over external assumptions):\n';
      results.forEach((res, i) => {
        contextPrompt += `[Source ${i + 1}: ${res.document.title} (${res.matchPercentage}% match)]\n${res.document.content}\nCitation: ${res.document.citation}\n\n`;
        sourcesList.push({
          title: res.document.title,
          citation: res.document.citation,
          score: res.matchPercentage
        });
      });
    }

    return {
      query,
      results,
      contextPrompt,
      sourcesList
    };
  }
}
