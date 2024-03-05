import { getMemory, setMemory } from "@/utils/memory.ts";
import { Model, Plan } from "@/api/types.tsx";

export function savePreferenceModels(models: Model[]): void {
  setMemory("model_preference", models.map((item) => item.id).join(","));
}

export function getPreferenceModels(): string[] {
  const memory = getMemory("model_preference");
  return memory.length ? memory.split(",") : [];
}

export function loadPreferenceModels(models: Model[]): Model[] {
  models = models.filter((item) => item.id.length > 0 && item.name.length > 0);

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

export function setOfflineModels(models: Model[]): void {
  setMemory("model_offline", JSON.stringify(models));
}

export function parseOfflineModels(models: string): Model[] {
  try {
    const parsed = JSON.parse(models);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item): Model | null => {
        if (!item || typeof item !== "object") {
          return null;
        }

        if (!item.id || !item.name) {
          return null;
        }

        return {
          id: item.id || "",
          name: item.name || "",
          description: item.description || "",
          free: item.free || false,
          auth: item.auth || false,
          default: item.default || false,
          high_context: item.high_context || false,
          avatar: item.avatar || "",
          tag: item.tag || [],
          price: item.price,
        } as Model;
      })
      .filter((item): item is Model => item !== null);
  } catch {
    return [];
  }
}

export function getOfflineModels(): Model[] {
  const memory = getMemory("model_offline");
  return memory && memory.length ? parseOfflineModels(memory) : [];
}

export function setOfflinePlans(plans: Plan[]): void {
  setMemory("plan_offline", JSON.stringify(plans));
}

export function parseOfflinePlans(plans: string): Plan[] {
  try {
    const parsed = JSON.parse(plans);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => typeof item === "object");
  } catch {
    return [];
  }
}

export function getOfflinePlans(): Plan[] {
  const memory = getMemory("plan_offline");
  return memory && memory.length ? parseOfflinePlans(memory) : [];
}
