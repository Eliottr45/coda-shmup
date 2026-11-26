import Entity from "../entities/Entity.ts";
import IComponent from "./IComponent.ts";
import Enemy from "../entities/Enemy.ts";
import {ShipMovementData} from "../gameData/ShipMovementData.ts";

export default class Movement implements IComponent {
    public enabled: boolean = true;

    private _movementData: ShipMovementData;
    private _speed: number = 0;


    public constructor(movementData: ShipMovementData, speed?: number) {
        if (speed) {
            this._speed = speed;
        }
        this._movementData = movementData;
    }

    public setSpeed(speed: number) {
        this._speed = speed;
    }

    public moveHorizontally(entity: Entity, deltaTime: number) {
        if (!this.enabled)
            return;

        entity.x += this._speed * deltaTime;
    }

    public moveVertically(entity: Entity, deltaTime: number) {
        if (!this.enabled)
            return;

        entity.y += this._speed * deltaTime;
    }

    public moveSinus(entityEnemy: Enemy, deltaTime: number) {
        if (!this.enabled)
            return;
        entityEnemy.x = entityEnemy.x + Math.sin(deltaTime * this._movementData.frequency) * this._movementData.amplitude;
    }

    public move(entity: Entity, deltaTime: number) {
        if(this._movementData.type == 'sinus'){

        }
        if(this._movementData.type == 'vertical'){
            return this.moveVertically(entity, deltaTime);
        }
    }
}