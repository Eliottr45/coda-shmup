import {GameObjects, Scenes, Scene} from "phaser";
import Health from "../components/Health.ts";
import Player from "../entities/Player.ts";
import GameConstants from "../GameConstants.ts";
import RegistryConstants from "../RegistryConstants.ts";

export default class MainUIScene extends Scene {
    private static readonly HEART_TEXTURE: string = "ui-heart";
    private static readonly HEART_SPACING: number = 72;

    private _hearts: GameObjects.Image[] = [];
    private _scoreText: GameObjects.BitmapText;

    constructor() {
        super(GameConstants.SceneKeys.MAIN_UI);
    }

    // noinspection JSUnusedGlobalSymbols
    init() {
        this.game.events.on(GameConstants.Events.PLAYER_SPAWNED_EVENT, this.onPlayerSpawned, this);
        this.registry.events.on(RegistryConstants.Events.PLAYER_SCORE_CHANGE, this.onPlayerScoreChanged, this);

        this.events.once(Scenes.Events.SHUTDOWN, () => {
            this.game.events.off(GameConstants.Events.PLAYER_SPAWNED_EVENT, this.onPlayerSpawned, this);
            this.registry.events.off(RegistryConstants.Events.PLAYER_SCORE_CHANGE, this.onPlayerScoreChanged, this);
        }, this);
    }

    // noinspection JSUnusedGlobalSymbols
    create() {
        this.createHeartTexture();

        let scoreStr: string = "".padStart(GameConstants.MAX_SCORE_DIGITS, "0");
        if (this.registry.has(RegistryConstants.Keys.PLAYER_SCORE))
            scoreStr = this.registry.get(RegistryConstants.Keys.PLAYER_SCORE).toString()
                .padStart(GameConstants.MAX_SCORE_DIGITS, "0");
        this._scoreText = this.add.bitmapText(this.scale.width - 64, 64, "future-bmp", scoreStr, 128)
            .setOrigin(1, 0);

        this.scene.bringToTop();

        console.log("MainUIScene created");
    }

    private onPlayerScoreChanged(_: any, value: number) {
        const scoreStr: string = value.toString().padStart(GameConstants.MAX_SCORE_DIGITS, "0");
        this._scoreText.setText(scoreStr);
    }

    private onPlayerSpawned(player: Player) {
        const health = player.getComponent(Health);
        if (!health) return;

        this.createHearts(health.max);
        this.updateHearts(health.current, false);

        health.on(Health.CHANGE_EVENT, (current: number) => {
            this.updateHearts(current, true);
        }, this);
    }

    // Draws a heart once and stores it as a texture, since the spritesheet has none
    private createHeartTexture() {
        if (this.textures.exists(MainUIScene.HEART_TEXTURE)) return;

        const g = this.make.graphics({x: 0, y: 0}, false);
        g.fillStyle(0xff3355);
        g.fillCircle(12, 12, 12);
        g.fillCircle(36, 12, 12);
        g.fillTriangle(1, 17, 47, 17, 24, 44);
        g.fillStyle(0xffffff, 0.6);
        g.fillCircle(10, 9, 4);
        g.generateTexture(MainUIScene.HEART_TEXTURE, 48, 46);
        g.destroy();
    }

    private createHearts(count: number) {
        this._hearts.forEach(heart => heart.destroy());
        this._hearts = [];

        for (let i = 0; i < count; i++) {
            const heart = this.add.image(96 + i * MainUIScene.HEART_SPACING, 96, MainUIScene.HEART_TEXTURE)
                .setScale(1.2);

            // Idle heartbeat, slightly offset per heart
            this.tweens.add({
                targets: heart,
                scale: 1.35,
                duration: 300,
                yoyo: true,
                repeat: -1,
                repeatDelay: 700,
                delay: i * 120,
                ease: "Sine.easeInOut"
            });

            this._hearts.push(heart);
        }
    }

    private updateHearts(current: number, animate: boolean) {
        this._hearts.forEach((heart, i) => {
            const full = i < current;
            const wasFull = heart.getData("full") !== false;
            heart.setData("full", full);

            if (full) {
                heart.clearTint().setAlpha(1);
                return;
            }

            if (animate && wasFull) {
                // Lost heart: pop, flash white, then stay as a dark empty heart
                heart.setTintFill(0xffffff);
                this.tweens.add({
                    targets: heart,
                    angle: {from: -20, to: 20},
                    duration: 60,
                    yoyo: true,
                    repeat: 3,
                    onComplete: () => {
                        heart.setAngle(0).setTint(0x333333).setAlpha(0.5);
                    }
                });
            } else {
                heart.setTint(0x333333).setAlpha(0.5);
            }
        });
    }
}
