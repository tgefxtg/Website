export type Preferences = {
  theme: "dark" | "light" | "system";
  motion: boolean;
  enter: boolean;
  speed: "natural" | "fast";
};
export const defaults: Preferences = {
  theme: "dark",
  motion: true,
  enter: true,
  speed: "natural",
};
