import { db } from "../lib/firebase";
import {
  collection, addDoc, query, where, getDocs,
  serverTimestamp, orderBy,
} from "firebase/firestore";
import type { ConclusionData, DecisionMemo } from "../types";

export interface DecisionMemoDoc {
  id?:               string;
  userId:            string;
  userEmail:         string | null;
  projectId:         string | null;
  roomId:            string;
  runId:             string;
  title:             string | null;
  memo:              DecisionMemo | null;
  rawText:           string;
  parseError:        boolean;
  parseErrorMessage: string | null;
  provider:          string | null;
  model:             string | null;
  runNumber?:        number;
  createdAt?:        unknown;
  updatedAt?:        unknown;
}

export const decisionMemosService = {
  async save(
    conclusion: ConclusionData,
    userId: string,
    userEmail: string | null,
    roomId: string,
    projectId: string | null,
  ): Promise<string | null> {
    if (!db) return null;
    try {
      const ref = await addDoc(collection(db, "decisionMemos"), {
        userId,
        userEmail,
        projectId,
        roomId,
        runId:             conclusion.runId ?? "",
        title:             null,
        memo:              conclusion.decisionMemo ?? null,
        rawText:           conclusion.summary,
        parseError:        conclusion.parseError ?? false,
        parseErrorMessage: conclusion.parseErrorMessage ?? null,
        provider:          conclusion.provider ?? null,
        model:             conclusion.model ?? null,
        runNumber:         conclusion.runNumber ?? null,
        createdAt:         serverTimestamp(),
        updatedAt:         serverTimestamp(),
      });
      return ref.id;
    } catch (err) {
      console.error("[decisionMemosService] Firestore save failed:", err);
      return null;
    }
  },

  async getForRoom(roomId: string, userId: string): Promise<ConclusionData[]> {
    if (!db) return [];
    try {
      const q = query(
        collection(db, "decisionMemos"),
        where("roomId", "==", roomId),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data() as DecisionMemoDoc;
        const ts = data.createdAt as { toDate?: () => Date } | undefined;
        return {
          summary:       data.rawText ?? "",
          keyPoints:     [],
          generatedAt:   ts?.toDate?.()?.toISOString() ?? new Date().toISOString(),
          runId:         data.runId,
          runNumber:     data.runNumber ?? undefined,
          isProvisional: false,
          isFinal:       true,
          decisionMemo:  data.memo ?? undefined,
          parseError:    data.parseError,
        } satisfies ConclusionData;
      });
    } catch (err) {
      console.error("[decisionMemosService] Firestore fetch failed:", err);
      return [];
    }
  },
};
