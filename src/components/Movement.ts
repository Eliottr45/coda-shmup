import Entity from "../entities/Entity.ts";
import IComponent from "./IComponent.ts";
import {ShipMovementData} from "../gameData/ShipMovementData.ts";

export default class Movement implements IComponent {
    public enabled: boolean = true;

    private _movementData: ShipMovementData;
    private _speed: number = 0;
    private _elapsed = 0;
    private _startX = 0;


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

    public reset(x: number) {
        this._elapsed = 0;
        this._startX = x;
    }

    public moveSinus(entity: Entity, deltaTime: number) {
        if (!this.enabled || this._movementData.type != 'sinus')
            return;

        if(this._startX == null){
            this._startX = entity.x;
        }

        this._elapsed += deltaTime / 1000;
        const {amplitude, frequency} = this._movementData;

        entity.y += this._speed * deltaTime;
        entity.x = this._startX + Math.sin(this._elapsed * frequency * Math.PI * 2) * amplitude;

    }

    public move(entity: Entity, deltaTime: number) {
        if (this._movementData.type === 'sinus')
            this.moveSinus(entity, deltaTime);
        else
            this.moveVertically(entity, deltaTime);
    }

}
