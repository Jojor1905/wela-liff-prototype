"use client";

import { createContext, useContext, useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { recommendationForNewImage, type RecommendationState } from "../models/recommendation";
import { releaseUploadedPhoto } from "../lib/photo-flow";

interface RecommendationContextValue {
  recommendation: RecommendationState;
  setRecommendation: Dispatch<SetStateAction<RecommendationState>>;
}

const RecommendationContext = createContext<RecommendationContextValue | null>(null);

export function RecommendationProvider({ children }: { children: ReactNode }) {
  const [recommendation, setRecommendation] = useState<RecommendationState>(recommendationForNewImage);
  const latestPhoto = useRef(recommendation.photo);

  useEffect(() => {
    latestPhoto.current = recommendation.photo;
  }, [recommendation.photo]);

  useEffect(() => () => releaseUploadedPhoto(latestPhoto.current), []);

  return (
    <RecommendationContext.Provider value={{ recommendation, setRecommendation }}>
      {children}
    </RecommendationContext.Provider>
  );
}

export function useRecommendation() {
  const value = useContext(RecommendationContext);
  if (!value) throw new Error("useRecommendation must be used inside RecommendationProvider");
  return value;
}
