import Entity from "../entities/Entity.ts";
import IComponent from "./IComponent.ts";
import {ShipMovementData} from "../gameData/ShipMovementData.ts";

export default class Movement implements IComponent {
    public enabled: boolean = true;

    private _movementData!: ShipMovementData;
    private _type!: ShipMovementData["type"]; // Récupère automatiquement le type exact de 'type'
    private _speed: number = 0;
    private _frequency: number = 0; // Valeur par défaut = plus besoin de gérer undefined
    private _amplitude: number = 0;

    private _elapsed: number = 0;
    private _startX: number | null = null;


    public constructor(movementData: ShipMovementData) {
        this._movementData = movementData;
        this.setMovementData(this._movementData);
    }

  public setSpeed(speed: number) {
    this._speed = speed;
  }

    public setMovementData(movementData: ShipMovementData) {
        this._movementData = movementData;

        this._type = movementData.type;
        this._speed = movementData.speedMovement;

        if (movementData.type === 'sinus') {
            this._frequency = movementData.frequency ?? 0;
            this._amplitude = movementData.amplitude ?? 0;
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
        if (!this.enabled || this._type != 'sinus')
            return;

        if(this._startX == null){
            this._startX = entity.x;
        }

        this._elapsed += deltaTime / 1000;


        entity.y += this._speed * deltaTime;
        entity.x = this._startX + Math.sin(this._elapsed * this._frequency * Math.PI * 2) * this._amplitude;

    }

    public move(entity: Entity, deltaTime: number) {
        if (this._movementData.type === 'sinus')
            this.moveSinus(entity, deltaTime);
        if (this._movementData.type === 'vertical')
            this.moveVertically(entity, deltaTime);
        if (this._movementData.type === 'horizontal'){
            this.moveSinus(entity, deltaTime);
        }
    }

}
