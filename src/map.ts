import { TileType, MapData } from './tiles';

export function createMap(width: number, height: number, tiles: TileType[]): MapData {
  if (tiles.length !== width * height) {
    throw new Error(`Map dimensions don't match tile array length. Expected ${width * height}, got ${tiles.length}`);
  }
  return { tiles, width, height };
}

export function getTileAt(map: MapData, x: number, y: number): TileType {
  if (x < 0 || x >= map.width || y < 0 || y >= map.height) {
    return TileType.NONE;
  }
  return map.tiles[y * map.width + x];
}

// Example map for testing
export function createSampleMap(): MapData {
  const width = 10;
  const height = 10;
  const tiles: TileType[] = new Array(width * height).fill(TileType.GRASS);
  
  // // Add some dirt patches
  // for (let y = 5; y < 10; y++) {
  //   for (let x = 5; x < 10; x++) {
  //     tiles[y * width + x] = TileType.DIRT;
  //   }
  // }
  // tiles[7 * width + 7] = TileType.WALL; // Wall in the center of first dirt patch
  
  // // Add another dirt patch
  // for (let y = 20; y < 25; y++) {
  //   for (let x = 30; x < 35; x++) {
  //     tiles[y * width + x] = TileType.DIRT;
  //   }
  // }
  // tiles[22 * width + 32] = TileType.WALL; // Wall in the center of second dirt patch
  
  // Add a wall border in one corner
  // for (let y = 10; y < 15; y++) {
  //   for (let x = 10; x < 15; x++) {
  //     if (y === 40 || y === 44 || x === 40 || x === 44) {
  //       tiles[y * width + x] = TileType.WALL;
  //     }
  //   }
  // }
  
  return createMap(width, height, tiles);
}
