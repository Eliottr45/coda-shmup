import type { BulletData } from "../gameData/BulletData.ts";
import Entity from "./Entity.ts";
import Health from "../components/Health.ts";
import Movement from "../components/Movement.ts";
import Weapon from "../components/Weapon.ts";
import { EnemyShipData, EnemyShipsData } from "../gameData/EnemyShipData.ts";

export default class Enemy extends Entity {
  private static readonly HIT_FLASH_DURATION_MS: number = 50;
  private static readonly HIT_SLOWDOWN_FACTOR: number = 0.5;
  private static readonly SHOOT_ANIM_FRAMERATE: number = 4;

  private readonly _bulletData: BulletData = {
    width: 12,
    height: 12,
    color: 0xf25f5c,
    speed: 512,
    damage: 1,
  };
  private _shootTimerConfig: Phaser.Types.Time.TimerEventConfig;
  private _shootTimer: Phaser.Time.TimerEvent;
  private _enemyShipData: EnemyShipData;

  public init(bulletsGroup: Phaser.Physics.Arcade.Group) {
    const defaultId = 2;
    this.selectEnemyShip(defaultId);

    this.addComponent(new Health(1, this));
    this.addComponent(new Movement(this._enemyShipData.movement));
    this.addComponent(
      new Weapon(bulletsGroup, this._bulletData),
    );

    // Listen once per enemy, not on every enable(): pooled enemies are reused many times
    const health = this.getComponent(Health);
    health?.on(Health.CHANGE_EVENT, () => {
      this.setTintFill(0xffffff);

      if (health?.current === 0) {
        this.stop();
        this.removeAllListeners(Phaser.Animations.Events.ANIMATION_COMPLETE);
        this._shootTimer.paused = true;
        this.disableBody();
      }

      this.scene.time.delayedCall(Enemy.HIT_FLASH_DURATION_MS, () => {
        this.clearTint();

        if (health?.current === 0) {
          this.disable();
        }
      });
    });

    this.angle = 90;

    this._shootTimerConfig = {
      delay: this._enemyShipData.weapon.fireDelay,
      callback: this.shoot,
      callbackScope: this,
      loop: true,
    };
    this._shootTimer = this.scene.time.addEvent(this._shootTimerConfig);

    this.selectEnemyShip(defaultId);
  }

  public selectEnemyShip(enemyShipDataId: number | string) {
    const enemyShipsData = this.scene.cache.json.get(
      "enemyShips",
    ) as EnemyShipsData;
    this._enemyShipData = enemyShipsData[enemyShipDataId];

    this.setTexture("sprites", this._enemyShipData.texture);

    const animKey = this._enemyShipData.shootAnimKey;
    const shootFrames = this._enemyShipData.shootFrames;
    if (animKey && shootFrames && !this.scene.anims.exists(animKey)) {
      this.scene.anims.create({
        key: animKey,
        frames: shootFrames.map((frameName) => ({
          key: "sprites",
          frame: frameName,
        })),
        frameRate: Enemy.SHOOT_ANIM_FRAMERATE,
      });
    }

    const bodyData = this._enemyShipData.body;
    const movementData = this._enemyShipData.movement;
    this.arcadeBody.setCircle(
      bodyData.radius,
      bodyData.offsetX,
      bodyData.offsetY,
    );

    this.getComponent(Movement)?.setMovementData(movementData);
    this.getComponent(Movement)?.setSpeed(movementData.speedMovement);

    if (this._shootTimerConfig) {
      this._shootTimerConfig.delay = this._enemyShipData.weapon.fireDelay;
    }
  }

  public enable(x: number, y: number, enemyShipId: number | string = 1) {
    this.stop();
    this.removeAllListeners(Phaser.Animations.Events.ANIMATION_COMPLETE);
    this.clearTint();

    this.selectEnemyShip(enemyShipId);
    this.enableBody(true, x, y - this.displayHeight, true, true);
    this.getComponent(Movement)?.reset(this.x);

    this._shootTimer.reset(this._shootTimerConfig);

    const health = this.getComponent(Health);
    health?.heal(health!.max, false);
  }

  public disable() {
    this.stop();
    this.removeAllListeners(Phaser.Animations.Events.ANIMATION_COMPLETE);
    this.clearTint();

    this.disableBody(true, true);
    this._shootTimer.paused = true;
  }

  private shoot() {
    const { bulletCount, spreadAngle } = this._enemyShipData.weapon;
    const animKey = this._enemyShipData.shootAnimKey;

    if (animKey) {
      this.removeAllListeners(Phaser.Animations.Events.ANIMATION_COMPLETE);
      this.play(animKey);
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.setTexture("sprites", this._enemyShipData.texture);

        this.getComponent(Weapon)?.spreadShoot(this, Phaser.Math.DegToRad(spreadAngle), bulletCount);
        this.scene.sound.play("sfx_laser2");
      });
    } else {
      this.getComponent(Weapon)?.spreadShoot(this, Phaser.Math.DegToRad(spreadAngle), bulletCount);
      this.scene.sound.play("sfx_laser2");
    }
  }

  preUpdate(timeSinceLaunch: number, deltaTime: number) {
    super.preUpdate(timeSinceLaunch, deltaTime);

    if (this.y > this.scene.cameras.main.height + this.displayHeight) {
      this.disable();
      return;
    }

    const effectiveDelta = this.isTinted
      ? deltaTime * Enemy.HIT_SLOWDOWN_FACTOR
      : deltaTime;
    this.getComponent(Movement)?.move(this, effectiveDelta);

    // Enemy is rotated 90°, so its horizontal extent on screen is displayHeight
    const halfVisualWidth = this.displayHeight / 2;
    this.x = Phaser.Math.Clamp(
      this.x,
      halfVisualWidth,
      this.scene.cameras.main.width - halfVisualWidth,
    );
  }
}
