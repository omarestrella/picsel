export type Cell = {
  id: string;
  color: string;
  x: number;
  y: number;
};
export type Layer = {
  id: string;
  name: string;
  cells: Cell[];
};
export type ProjectSize = {
  width: number;
  height: number;
};
export type Project = {
  id: string;
  name: string;
  layers: Layer[];
  size: ProjectSize;
};
