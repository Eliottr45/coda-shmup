import { Physics } from "phaser";
import { BulletData } from "../gameData/BulletData.ts";
import { WeaponData } from "../gameData/WeaponData.ts";
import Bullet from "../entities/Bullet.ts";
import Entity from "../entities/Entity.ts";
import IComponent from "./IComponent.ts";

export default class Weapon implements IComponent {
  public enabled: boolean = true;

  private readonly _bullets: Physics.Arcade.Group;
  private readonly _bulletData: BulletData;
  private _weaponData: WeaponData = {
    bulletCount: 1,
    spreadAngle: 0,
    fireDelay: 0,
  };

  constructor(
    bullets: Physics.Arcade.Group,
    bulletData: BulletData,
    weaponData?: WeaponData,
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

  public setWeaponData(weaponData: WeaponData) {
    this._weaponData = weaponData;
  }

  public shoot(source: Entity) {
    this.spreadShoot(
      source,
      this._weaponData.bulletCount,
      this._weaponData.spreadAngle,
    );
  }

  public spreadShoot(source: Entity, bulletCount: number, spreadAngle: number) {
    if (!this.enabled || !this._bullets || bulletCount <= 0) return;

    const step =
      spreadAngle >= 360
        ? spreadAngle / bulletCount
        : spreadAngle / Math.max(bulletCount - 1, 1);
    const start = bulletCount > 1 && spreadAngle < 360 ? -spreadAngle / 2 : 0;

    for (let i = 0; i < bulletCount; i++) {
      const bullet = this._bullets.get() as Bullet;
      if (!bullet) break;

      const angle = source.rotation + Phaser.Math.DegToRad(start + i * step);
      const direction = new Phaser.Math.Vector2(1, 0).rotate(angle);
      const bulletVelocity = direction.clone().scale(this._bulletData.speed);

      bullet.enable(
        source.x + direction.x * source.arcadeBody.radius,
        source.y + direction.y * source.arcadeBody.radius,
        bulletVelocity.x,
        bulletVelocity.y,
        this._bulletData,
      );
    }
  }
}
