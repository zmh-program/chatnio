import fs from "fs";
import path from "path";

export function readJSON(...paths: string[]): any {
  return JSON.parse(fs.readFileSync(path.resolve(...paths)).toString());
}

export function writeJSON(data: any, ...paths: string[]): void {
  fs.writeFileSync(path.resolve(...paths), JSON.stringify(data, null, 2));
}

export function getMigration(
  mother: Record<string, any>,
  data: Record<string, any>,
  prefix: string,
): string[] {
  return Object.keys(mother)
    .map((key): string[] => {
      const template = mother[key],
        translation = data !== undefined && key in data ? data[key] : undefined;
      const val = [prefix.length === 0 ? key : `${prefix}.${key}`];

      switch (typeof template) {
        case "string":
          if (typeof translation !== "string") return val;
          else if (template.startsWith("!!")) return val;
          break;
        case "object":
          return getMigration(template, translation, val[0]);
        default:
          return typeof translation === typeof template ? [] : val;
      }

      return [];
    })
    .flat()
    .filter((key) => key !== undefined && key.length > 0);
}

export function getFields(data: any): number {
  switch (typeof data) {
    case "string":
      return 1;
    case "object":
      if (Array.isArray(data)) return data.length;
      return Object.keys(data).reduce(
        (acc, key) => acc + getFields(data[key]),
        0,
      );
    default:
      return 1;
  }
}

export function getTranslation(data: Record<string, any>, path: string): any {
  const keys = path.split(".");
  let current = data;
  for (const key of keys) {
    if (current[key] === undefined) return undefined;
    current = current[key];
  }
  return current;
}

export function setTranslation(
  data: Record<string, any>,
  path: string,
  value: any,
): void {
  const keys = path.split(".");
  let current = data;
  for (let i = 0; i < keys.length - 1; i++) {
    if (current[keys[i]] === undefined) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}
