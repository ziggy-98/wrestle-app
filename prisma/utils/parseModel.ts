export function parseModel<T>(model: Record<string, any>): T {
  return Object.entries(model).reduce<T>((acc, [key, value]) => {
    if (typeof value === "bigint") {
      return {
        ...acc,
        [key]: parseInt(value.toString()),
      };
    }
    return {
      ...acc,
      [key]: value,
    };
  }, {} as T);
}
