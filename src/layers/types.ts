export type Layer = {
  name: string;
  input?: () => void;
  update?: (dt: number) => void;
  draw?: () => void;
};
