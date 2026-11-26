import {ShipBodyData} from "./ShipBodyData.ts";
import {ShipMovementData} from "./ShipMovementData.ts";

export type PlayerShipsData = {
    [key: string]: PlayerShipData
}

export type PlayerShipData = {
    movement: ShipMovementData;
    texture: string;
    body: ShipBodyData;
}