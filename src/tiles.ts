export enum TileType {
  NONE = 0,
  GRASS = 1,
  DIRT = 2,
  WALL = 3,
}

export interface MapData {
  tiles: TileType[];
  width: number;
  height: number;
}

export function getTileColor(tile: TileType): string {
  switch (tile) {
    case TileType.NONE:
      return 'transparent';
    case TileType.GRASS:
      return 'green';
    case TileType.DIRT:
      return 'brown';
    case TileType.WALL:
      return 'black';
    default:
      return 'transparent';
  }
}
