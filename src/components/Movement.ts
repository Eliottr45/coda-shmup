import Entity from "../entities/Entity.ts";
import IComponent from "./IComponent.ts";
import {ShipMovementData} from "../gameData/ShipMovementData.ts";

export default class Movement implements IComponent {
    public enabled: boolean = true;

    private _movementData?: ShipMovementData;
    private _type: ShipMovementData["type"] = 'vertical';
    private _speed: number = 0;
    private _frequency: number = 0; // Valeur par défaut = plus besoin de gérer undefined
    private _amplitude: number = 0;

    private _elapsed: number = 0;
    private _startX: number = 0;

    public constructor(movementData?: ShipMovementData, speed?: number) {
        if (movementData) {
            this.setMovementData(movementData);
        }
        if (speed !== undefined) {
            this._speed = speed;
        }
    }

    public setSpeed(speed: number) {
        this._speed = speed;
    }

    public setMovementData(movementData: ShipMovementData) {
        this._movementData = movementData;

        this._type = movementData.type;
        this._speed = movementData.speedMovement;

        if (movementData.type === 'sinus') {
            this._frequency = movementData.frequency;
            this._amplitude = movementData.amplitude;
        } else {
            this._frequency = 0;
            this._amplitude = 0;
        }
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

    // Called when a pooled entity is enabled again, so the sine wave restarts from its spawn position
    public reset(x: number) {
        this._elapsed = 0;
        this._startX = x;
    }

    public moveSinus(entity: Entity, deltaTime: number) {
        if (!this.enabled || this._type !== 'sinus')
            return;

        this._elapsed += deltaTime / 1000;


        entity.y += this._speed * deltaTime;
        entity.x = this._startX + Math.sin(this._elapsed * this._frequency * Math.PI * 2) * this._amplitude;

    }

    public move(entity: Entity, deltaTime: number) {
        if (this._movementData?.type === 'sinus') {
            this.moveSinus(entity, deltaTime);
        } else if (this._movementData?.type === 'horizontal') {
            this.moveHorizontally(entity, deltaTime);
        } else {
            this.moveVertically(entity, deltaTime);
        }
    }

}
