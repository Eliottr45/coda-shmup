import { Physics } from "phaser";
import { BulletData } from "../gameData/BulletData.ts";
import { ShipWeaponData } from "../gameData/ShipWeaponData.ts";
import Bullet from "../entities/Bullet.ts";
import Entity from "../entities/Entity.ts";
import IComponent from "./IComponent.ts";

export default class Weapon implements IComponent {
  public enabled: boolean = true;

  private readonly _bullets: Physics.Arcade.Group;
  private readonly _bulletData: BulletData;
private _weaponData: ShipWeaponData = {
    bulletCount: 1,
    spreadAngle: 0,
    fireDelay: 0,
  };

  constructor(
    bullets: Physics.Arcade.Group,
    bulletData: BulletData,
    weaponData?: ShipWeaponData,
  ) {
    if (!bullets) {
      console.error("Weapon 'bullets' group cannot be null or undefined");
    }

    this._bullets = bullets;
    this._bulletData = bulletData;
    if (weaponData) {
      this._weaponData = weaponData;
    }
  }

  public setWeaponData(weaponData: ShipWeaponData) {
    this._weaponData = weaponData;
  }

  public shoot(source: Entity) {
    if (!this.enabled || !this._bullets) return;

    const bulletCount = Math.max(1, this._weaponData.bulletCount);
    const spreadAngleRad = Phaser.Math.DegToRad(this._weaponData.spreadAngle);

    let startAngle = source.rotation;
    let angleStep = 0;

    if (bulletCount > 1) {
      angleStep =
        this._weaponData.spreadAngle >= 360
          ? spreadAngleRad / bulletCount
          : spreadAngleRad / (bulletCount - 1);
      startAngle = source.rotation - spreadAngleRad / 2;
    }

    if (this._bullets) {
      for (let i = 0; i < bulletCount; i++) {
        const bullet: Bullet = this._bullets.get() as Bullet;
        if (!bullet) break;

        const angle = startAngle + i * angleStep;
        const forward: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
          1,
          0,
        ).rotate(angle);
        const bulletVelocity: Phaser.Math.Vector2 = forward
          .clone()
          .scale(this._bulletData.speed);

        bullet.enable(
          source.x + forward.x * source.arcadeBody.radius,
          source.y + forward.y * source.arcadeBody.radius,
          bulletVelocity.x,
          bulletVelocity.y,
          this._bulletData,
        );
      }
    }
  }
}
