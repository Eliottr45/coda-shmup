import {GameObjects, Plugins, Physics, Scene} from "phaser";
import Health from "../components/Health.ts";
import Bullet from "../entities/Bullet.ts";
import Enemy from "../entities/Enemy.ts";
import Player from "../entities/Player.ts";
import {EnemyShipData, EnemyShipsData} from "../gameData/EnemyShipData.ts";
import GroupUtils from "../utils/GroupUtils.ts";
import GameConstants from "../GameConstants.ts";
import RegistryConstants from "../RegistryConstants.ts";

export default class EntityManager extends Plugins.ScenePlugin {
    public static readonly PLUGIN_KEY: string = 'EntityManager';
    public static readonly MAPPING_NAME: string = 'entityManager';

    private static readonly PLAYER_BULLET_POOL_SIZE: number = 64;
    private static readonly ENEMY_BULLET_POOL_SIZE: number = 512;
    private static readonly MAX_ACTIVE_ENEMIES: number = 5;
    private static readonly SPAWN_MARGIN: number = 64;
    private static readonly PLAYER_SPAWN_BOTTOM_OFFSET: number = 128;

    // noinspection JSUnusedGlobalSymbols
    private readonly bulletGroupConfig = {
        classType: Bullet,
        maxSize: EntityManager.ENEMY_BULLET_POOL_SIZE,
        runChildUpdate: true,
        createCallback: (bullet: GameObjects.GameObject) => {
            (bullet as Bullet).init();
        }
    };

    private _player: Player;
    private _playerBullets: Physics.Arcade.Group;
    private _enemies: Physics.Arcade.Group;
    private _enemyBullets: Physics.Arcade.Group;

    constructor(scene: Scene, pluginManager: Plugins.PluginManager) {
        super(scene, pluginManager, EntityManager.PLUGIN_KEY);
    }

    destroy() {
        super.destroy();
    }

    public initAndSpawnPlayer(): Player {
        this._playerBullets = this.scene!.physics.add.group({
            ...this.bulletGroupConfig,
            maxSize: EntityManager.PLAYER_BULLET_POOL_SIZE
        });
        GroupUtils.populate(EntityManager.PLAYER_BULLET_POOL_SIZE, this._playerBullets);

        this._player = new Player(
            this.scene!,
            this.scene!.cameras.main.centerX,
            this.scene!.cameras.main.height - EntityManager.PLAYER_SPAWN_BOTTOM_OFFSET
        );
        this._player.init(this._playerBullets);

        this.game!.events.emit(GameConstants.Events.PLAYER_SPAWNED_EVENT, this._player);

        return this._player;
    }

    public initEnemies(): Physics.Arcade.Group {
        this._enemyBullets = this.scene!.physics.add.group(this.bulletGroupConfig);
        GroupUtils.populate(EntityManager.ENEMY_BULLET_POOL_SIZE, this._enemyBullets);

        this._enemies = this.scene!.physics.add.group({
            classType: Enemy,
            defaultKey: 'sprites',
            defaultFrame: 'ufoRed',
            createCallback: (enemy) => {
                (enemy as Enemy).init(this._enemyBullets);
            }
        });

        const enemyShips = this.scene!.cache.json.get('enemyShips') as EnemyShipsData;
        for (const [id, data] of Object.entries(enemyShips)) {
            this.scene!.time.addEvent({
                delay: data.spawnDelay,
                callback: () => this.spawnEnemy(id, data),
                callbackScope: this,
                loop: true
            });
        }

        return this._enemies;
    }

    public initGroupCollisions() {
        this.scene!.physics.add.overlap(this._playerBullets, this._enemies, (bullet, enemy) => {
            this.scene!.registry.inc(RegistryConstants.Keys.PLAYER_SCORE);

            (bullet as Bullet).disable();
            (enemy as Enemy).getComponent(Health)?.damage((bullet as Bullet).damage);
        });

        this.scene!.physics.add.overlap(this._player, this._enemyBullets, (player, bullet) => {
            (bullet as Bullet).disable();
            (player as Player).getComponent(Health)?.damage((bullet as Bullet).damage);

            this.scene?.cameras.main.shake(100, 0.01);
        });

        this.scene!.physics.add.overlap(this._player, this._enemies, (player, enemy) => {
            this.scene!.registry.inc(RegistryConstants.Keys.PLAYER_SCORE);

            const enemyHealth = (enemy as Enemy).getComponent(Health);
            enemyHealth?.damage(enemyHealth?.max);

            const playerHealth = (player as Player).getComponent(Health);
            playerHealth?.damage(1);

            this.scene?.cameras.main.shake(100, 0.03);
        });
    }

    private spawnEnemy(id: string | number, data: EnemyShipData) {
        if (this._enemies.countActive(true) >= EntityManager.MAX_ACTIVE_ENEMIES) {
            return;
        }

        const enemy = this._enemies.get() as Enemy;
        if (!enemy) {
            return;
        }

        const amplitude = data.movement.type === 'sinus' ? data.movement.amplitude : 0;
        const frame = this.scene!.textures.getFrame('sprites', data.texture);
        const halfVisualWidth = frame ? Math.ceil(Math.max(frame.width, frame.height) / 2) : 0;
        const margin = Math.max(EntityManager.SPAWN_MARGIN, halfVisualWidth);

        const screenWidth = this.scene!.cameras.main.width;
        const minX = amplitude + margin;
        const maxX = screenWidth - amplitude - margin;
        const spawnX = minX <= maxX ? Phaser.Math.Between(minX, maxX) : screenWidth / 2;

        enemy.enable(spawnX, 0, id);

        this.game!.events.emit(GameConstants.Events.ENEMY_SPAWNED_EVENT, enemy);
    }
}