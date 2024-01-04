import { getMemory, setMemory } from "@/utils/memory.ts";
import { Model } from "@/api/types.ts";

export function savePreferenceModels(models: Model[]): void {
  setMemory("model_preference", models.map((item) => item.id).join(","));
}

export function getPreferenceModels(): string[] {
  const memory = getMemory("model_preference");
  return memory.length ? memory.split(",") : [];
}

export function loadPreferenceModels(models: Model[]): Model[] {
  // sort by preference
  const preference = getPreferenceModels();

  return models.sort((a, b) => {
    const aIndex = preference.indexOf(a.id);
    const bIndex = preference.indexOf(b.id);

    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
  });
}
