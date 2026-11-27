import {ShipBodyData} from "./ShipBodyData.ts";
import {ShipMovementData} from "./ShipMovementData.ts";
import {WeaponData} from "./WeaponData.ts";

export type EnemyShipsData = {
    [key: string]: EnemyShipData;
};

export type EnemyShipData = {
    spawnDelay: number;
    movement: ShipMovementData;
    texture: string;
    shootAnimKey?: string;
    shootFrames?: string[];
    body: ShipBodyData;
    weapon: WeaponData;
};
