import ExistenceSystem from '../entitySystem/system/existence/ExistenceSystem';
import EntityFinder from '../util/entityStorage/EntityFinder';
import TickSystem from '../entitySystem/system/tick/TickSystem';
import EntityTrackerBuilder from './EntityTrackerBuilder';
import {Region} from '../entitySystem/alias';
import Entity from '../entitySystem/Entity';

export class ApplyClause {
  constructor(protected builder: EntityTrackerBuilder) {
  }

  applyExistenceSystem<T>(system: ExistenceSystem<T>): ToClause<T, T> {
    let systemApplier = new ExistenceSystemApplier(system);
    return this.createToClause(systemApplier);
  }

  applyTickSystem<T>(system: TickSystem<T>): ToClause<T, T> {
    let systemApplier = new TickSystemApplier(system);
    return this.createToClause(systemApplier);
  }

  protected createToClause<T>(systemApplier: SystemApplier<T>) {
    let systemApplierManager = new SystemApplierManager(systemApplier, systemApplier);
    return new ToClause(this.builder, systemApplierManager);
  }
}

export class ToClause<T, U> {
  constructor(
      private builder: EntityTrackerBuilder,
      private systemApplierManager: SystemApplierManager<T, U>) {
  }

  toLiftedEntities(): OfClause<Region<T>, U> {
    return this.createOfClause(this.systemApplierManager.lifted());
  }

  toEntities(): OfClause<T, U> {
    return this.createOfClause(this.systemApplierManager);
  }

  private createOfClause<V, W>(systemApplierManager: SystemApplierManager<V, W>) {
    return new OfClause(this.builder, systemApplierManager);
  }
}

export class OfClause<T, U> {
  constructor(
      private builder: EntityTrackerBuilder,
      private systemApplierManager: SystemApplierManager<T, U>) {
  }

  of<V extends T & Entity>(entityFinder: EntityFinder<V>): ApplyOrToOrOfOrBuildClause<T, U> {
    this.systemApplierManager.get().addToBuilder(this.builder, entityFinder);
    return new ApplyOrToOrOfOrBuildClause(this.builder, this.systemApplierManager);
  }
}

export class ApplyOrToOrOfOrBuildClause<T, U> extends ApplyClause {
  constructor(
      builder: EntityTrackerBuilder, private systemApplierManager: SystemApplierManager<T, U>) {
    super(builder);
  }

  toLiftedEntities() {
    return this.createToClause(this.systemApplierManager.getOriginal()).toLiftedEntities();
  }

  toEntities() {
    return this.createToClause(this.systemApplierManager.getOriginal()).toEntities();
  }

  and<V extends T & Entity>(entityFinder: EntityFinder<V>) {
    this.systemApplierManager.get().addToBuilder(this.builder, entityFinder);
    return this;
  }

  build() {
    return this.builder.build();
  }
}

interface SystemApplier<T> {
  addToBuilder<U extends T & Entity>(
      builder: EntityTrackerBuilder, entityFinder: EntityFinder<U>): void;

  lifted(): SystemApplier<Region<T>>;
}

class ExistenceSystemApplier<T> implements SystemApplier<T> {
  constructor(private system: ExistenceSystem<T>) {
  }

  addToBuilder<U extends T & Entity>(builder: EntityTrackerBuilder, entityFinder: EntityFinder<U>) {
    builder.applyExistenceSystem(this.system, entityFinder);
  }

  lifted(): SystemApplier<Region<T>> {
    return new ExistenceSystemApplier(new LiftExistenceSystemSystem(this.system));
  }
}

class LiftExistenceSystemSystem<T> implements ExistenceSystem<Region<T>> {
  constructor(private system: ExistenceSystem<T>) {
  }

  enter(region: Region<T>) {
    for (let entity of region.container) {
      this.system.enter(entity);
    }
  }

  exit(region: Region<T>) {
    for (let entity of region.container) {
      this.system.exit(entity);
    }
  }

  finish(): void {
    this.system.finish();
  }
}

class TickSystemApplier<T> implements SystemApplier<T> {
  constructor(private system: TickSystem<T>) {
  }

  addToBuilder<U extends T & Entity>(builder: EntityTrackerBuilder, entityFinder: EntityFinder<U>) {
    builder.applyTickSystem(this.system, entityFinder);
  }

  lifted(): SystemApplier<Region<T>> {
    return new TickSystemApplier(new LiftTickSystemSystem(this.system));
  }
}

class LiftTickSystemSystem<T> implements TickSystem<Region<T>> {
  constructor(private system: TickSystem<T>) {
  }

  update(region: Region<T>, time: Phaser.Time): void {
    for (let entity of region.container) {
      this.system.update(entity, time);
    }
  }

  tick(time: Phaser.Time) {
    this.system.tick(time);
  }
}

class SystemApplierManager<T, U> {
  constructor(
      private liftedSystemApplier: SystemApplier<T>,
      private originalSystemApplier: SystemApplier<U>) {
  }

  lifted(): SystemApplierManager<Region<T>, U> {
    return new SystemApplierManager(this.liftedSystemApplier.lifted(), this.originalSystemApplier);
  }

  get(): SystemApplier<T> {
    return this.liftedSystemApplier;
  }

  getOriginal(): SystemApplier<U> {
    return this.originalSystemApplier;
  }
}
