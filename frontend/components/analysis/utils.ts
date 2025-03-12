export function getTransportModeColor(mode: string) {
  const colors: Record<string, string> = {
    road: "#3b82f6",
    rail: "#10b981",
    sea: "#6366f1",
    air: "#f59e0b",
    multimodal: "#8b5cf6",
  };
  return colors[mode.toLowerCase()] || colors.road;
}
