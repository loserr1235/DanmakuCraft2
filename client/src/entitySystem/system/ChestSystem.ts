import {asSequence} from 'sequency';
import ChestLaw from '../../law/ChestLaw';
import Notifier, {NotificationPriority} from '../../output/notification/Notifier';
import EntityRegister from '../../util/entityStorage/EntityRegister';
import Distance from '../../util/math/Distance';
import Point from '../../util/syntax/Point';
import {ChestEntity} from '../alias';
import Entity from '../Entity';
import EntityFactory from '../EntityFactory';
import BuffDataApplier from './buff/BuffDataApplier';
import BuffDescription from './buff/BuffDescription';
import TickSystem from './tick/TickSystem';
import VisibilitySystem from './visibility/VisibilitySystem';

class ChestSystem implements TickSystem, VisibilitySystem<ChestEntity> {
  constructor(
      private readonly chestOpener: ChestOpener,
      private readonly chestSpawner: ChestSpawner,
      private readonly chestDemolisher: ChestDemolisher) {
  }

  tick(time: Phaser.Time) {
    this.chestSpawner.spawnIfAppropriate(time);
  }

  enter(component: ChestEntity) {
  }

  update(chest: ChestEntity) {
    if (this.chestOpener.execute(chest)) {
      this.chestSpawner.scheduleNextSpawning();
    }
  }

  exit(chest: ChestEntity) {
    this.chestDemolisher.demolish(chest);
  }

  finish() {
  }
}

export default ChestSystem;

export class ChestOpener {
  private static readonly CHEST_SHAKING_DISTANCE = 5;
  private static readonly CHEST_SHAKING_TIME_MS = 20;

  constructor(
      private game: Phaser.Game,
      private trackee: Entity,
      private buffDataApplier: BuffDataApplier,
      private law: ChestLaw,
      private notifier: Notifier,
      private buffDescription: BuffDescription,
      private chestTouchableDistance: Distance = new Distance(40)) {
  }

  execute(chest: ChestEntity) {
    if (chest.isOpen) {
      return false;
    }

    if (!this.doesTrackeeTryToOpen(chest)) {
      return false;
    }

    const ignored = this.open(chest);

    return true;
  }

  private doesTrackeeTryToOpen(chest: ChestEntity) {
    return this.chestTouchableDistance.isClose(this.trackee.coordinates, chest.coordinates);
  }

  private async open(chest: ChestEntity) {
    chest.isOpen = true;

    await this.playChestShakingAnimation(chest);

    const buffData = this.law.buffStrategy.next();
    this.buffDataApplier.activate(buffData);

    this.notifier.send(this.buffDescription.for(buffData), NotificationPriority.SKIP);
  }

  private async playChestShakingAnimation(chest: ChestEntity) {
    const tweenX = this.game.add.tween(chest.display)
        .to(
            {x: chest.display.x - ChestOpener.CHEST_SHAKING_DISTANCE / 2},
            ChestOpener.CHEST_SHAKING_TIME_MS / 2,
            Phaser.Easing.Quadratic.InOut,
            true);

    const tweenX2 = this.game.add.tween(chest.display)
        .to(
            {x: chest.display.x + ChestOpener.CHEST_SHAKING_DISTANCE},
            ChestOpener.CHEST_SHAKING_TIME_MS,
            Phaser.Easing.Quadratic.InOut,
            false,
            0,
            5,
            true);

    const tweenX3 = this.game.add.tween(chest.display)
        .to(
            {x: chest.display.x},
            ChestOpener.CHEST_SHAKING_TIME_MS / 2,
            Phaser.Easing.Quadratic.InOut,
            false);

    tweenX.chain(tweenX2);
    tweenX2.chain(tweenX3);

    return new Promise(resolve => {
      tweenX3.onComplete.addOnce(() => {
        chest.display.frame = 1;
        resolve();
      });
    });
  }
}

export class ChestSpawner {
  constructor(
      private chestsRegister: EntityRegister<ChestEntity>,
      private entityFactory: EntityFactory,
      private law: ChestLaw,
      private hasSchedule: boolean = false,
      private spawnInterval: number = 0) {
    if (!hasSchedule) {
      this.scheduleNextSpawning();
    }
  }

  spawnIfAppropriate(time: Phaser.Time) {
    if (this.hasSchedule) {
      this.spawnInterval -= time.physicsElapsedMS;
      if (this.spawnInterval > 0) {
        return;
      }

      this.hasSchedule = false;
    } else {
      if (asSequence(this.chestsRegister).any(chest => !chest.isOpen)) {
        return;
      }
    }
    this.spawnAt(this.law.spawnLocationStrategy.next());
  }

  scheduleNextSpawning() {
    this.spawnInterval = this.law.spawnIntervalStrategy.next();
    this.hasSchedule = true;
  }

  private spawnAt(coordinates: Point) {
    const chest = this.entityFactory.createChest(coordinates);
    this.chestsRegister.register(chest);
    return chest;
  }
}

export class ChestDemolisher {
  constructor(private chestsRegister: EntityRegister<ChestEntity>) {
  }

  demolish(chest: ChestEntity) {
    this.chestsRegister.deregister(chest);
  }
}
