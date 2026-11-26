import {ShipBodyData} from "./ShipBodyData.ts";
import {ShipMovementData} from "./ShipMovementData.ts";
import {WeaponData} from "./WeaponData.ts";

export type EnemyShipsData = {
    [key: string]: EnemyShipData
}

export type EnemyShipData = {
    movement: ShipMovementData;
    texture: string;
    body: ShipBodyData;
    weapons: WeaponData[];
}
