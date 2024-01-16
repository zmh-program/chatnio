import { Model } from "@/api/types.ts";
import { supportModels } from "@/conf/index.ts";

export function getModelFromId(id: string): Model | undefined {
  return supportModels.find((model) => model.id === id);
}

export function isHighContextModel(id: string): boolean {
  const model = getModelFromId(id);
  return !!model && model.high_context;
}
