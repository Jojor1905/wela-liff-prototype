import type { UploadedPhoto } from "../models/wela";
import { flowSteps } from "./flow-navigation";

export const photoFlowSteps = {
  introduction: flowSteps.scanIntroduction,
  source: flowSteps.photoSource,
  review: flowSteps.photoReview,
  beforeQuestionnaire: flowSteps.beforeQuestionnaire,
  questionnaire: flowSteps.gender,
} as const;

export const photoEntrySequence = [
  photoFlowSteps.introduction,
  photoFlowSteps.source,
  photoFlowSteps.review,
  photoFlowSteps.beforeQuestionnaire,
] as const;

export type PhotoSource = UploadedPhoto["source"];

type ObjectUrlApi = Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;

export function replaceUploadedPhoto(
  current: UploadedPhoto | null,
  file: File,
  source: PhotoSource,
  objectUrls: ObjectUrlApi = URL,
): UploadedPhoto {
  if (current) objectUrls.revokeObjectURL(current.previewUrl);
  return { file, source, previewUrl: objectUrls.createObjectURL(file) };
}

export function releaseUploadedPhoto(
  photo: UploadedPhoto | null,
  objectUrls: Pick<typeof URL, "revokeObjectURL"> = URL,
): void {
  if (photo) objectUrls.revokeObjectURL(photo.previewUrl);
}

export function reviewStepFor(photo: UploadedPhoto | null): "preview" | "upload" {
  return photo ? photoFlowSteps.review : photoFlowSteps.source;
}

export async function verifyPhotoDecodes(
  file: File,
  decode: (previewUrl: string) => Promise<void>,
  objectUrls: ObjectUrlApi = URL,
): Promise<void> {
  const previewUrl = objectUrls.createObjectURL(file);
  try {
    await decode(previewUrl);
  } finally {
    objectUrls.revokeObjectURL(previewUrl);
  }
}

export function decodeBrowserImage(previewUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("The selected file could not be decoded as an image."));
    image.src = previewUrl;
  });
}
