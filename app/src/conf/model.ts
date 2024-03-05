import { Model } from "@/api/types.tsx";

export function getModelFromId(market: Model[], id: string): Model | undefined {
  return market.find((model) => model.id === id);
}

export function isHighContextModel(market: Model[], id: string): boolean {
  const model = getModelFromId(market, id);
  return !!model && model.high_context;
}
