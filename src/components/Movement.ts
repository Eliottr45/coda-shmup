import Entity from "../entities/Entity.ts";
import IComponent from "./IComponent.ts";
import Enemy from "../entities/Enemy.ts";
import { ShipMovementData } from "../gameData/ShipMovementData.ts";

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
    if (!this.enabled) return;

    entity.x += this._speed * deltaTime;
  }

  public moveVertically(entity: Entity, deltaTime: number) {
    if (!this.enabled) return;

    entity.y += this._speed * deltaTime;
  }

  public moveSinus(entityEnemy: Enemy, deltaTime: number) {
    if (!this.enabled) return;
    if (this._movementData.type !== "sinus") return;

    const MS_PER_SECOND = 1000;
    const { amplitude, frequency } = this._movementData;
    // frequency is in oscillations per second, converted to radians per millisecond
    const angularSpeed = (2 * Math.PI * frequency) / MS_PER_SECOND;

    // The horizontal offset follows amplitude * sin(angularSpeed * time).
    // The entity moves by how much this offset changed since the previous frame,
    // so no state is stored and it stays correct when the enemy is reused from the pool.
    const now = entityEnemy.scene.time.now;
    const previous = now - deltaTime;
    entityEnemy.x +=
      amplitude *
      (Math.sin(angularSpeed * now) - Math.sin(angularSpeed * previous));

    this.moveVertically(entityEnemy, deltaTime);
  }

  public move(entity: Entity, deltaTime: number) {
    if (this._movementData.type == "sinus") {
    }
    if (this._movementData.type == "vertical") {
      return this.moveVertically(entity, deltaTime);
    }
  }
}
