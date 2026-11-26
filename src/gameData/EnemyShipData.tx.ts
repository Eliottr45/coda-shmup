import { ShipBodyData } from "./ShipBodyData.ts";
import { ShipMovementData } from "./ShipMovementData.ts";
import { ShipWeaponData } from "./WeaponData.ts";

export type EnemyShipsData = {
  [key: string]: EnemyShipData;
};

export type EnemyShipData = {
  spawnDelay: number;
  texture: string;
  tint?: number;
  movement: ShipMovementData;
  body: ShipBodyData;
};
