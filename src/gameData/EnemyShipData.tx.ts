import { ShipBodyData } from "./ShipBodyData.ts";
import { ShipMovementData } from "./ShipMovementData.ts";
import { WeaponData } from "./WeaponData.ts";

export type EnemyShipsData = {
  [key: string]: EnemyShipData;
};

export type EnemyShipData = {
  spawnDelay: number;
  texture: string;
  tint?: string | number;
  movement: ShipMovementData;
  body: ShipBodyData;
  weapon?: WeaponData;
  weapons?: WeaponData[];
};
