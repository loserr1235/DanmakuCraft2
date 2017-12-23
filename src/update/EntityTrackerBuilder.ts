import Entity from '../entitySystem/Entity';
import EntityFinder from '../util/entityStorage/EntityFinder';
import {Component} from '../entitySystem/alias';
import EntityTracker, {
  EntityFinderRecord, ExistenceSystemsFinisher,
  OneEntityFinderToManySystemsRecord
} from './EntityTracker';
import ExistenceSystem from '../entitySystem/system/existence/ExistenceSystem';
import TickSystem from '../entitySystem/system/tick/TickSystem';

export class EntityTrackerBuilder {
  constructor(
      private trackee: Entity,
      private samplingRadius: number,
      private entityFinders: Map<EntityFinder<Component>, OneEntityFinderToManySystemsRecordBuilder<Component>>,
      private existenceSystemsFinisher: ExistenceSystemsFinisher = new ExistenceSystemsFinisher()) {
  }

  applyExistenceSystem<T, U extends T>(system: ExistenceSystem<T>, entityFinder: EntityFinder<U>) {
    this.getTrackingRecordBuilder(entityFinder).addExistenceSystem(system);
    return this;
  }

  applyTickSystem<T, U extends T>(system: TickSystem<T>, entityFinder: EntityFinder<U>) {
    this.getTrackingRecordBuilder(entityFinder).addTickSystem(system);
    return this;
  }

  build() {
    if (this.entityFinders.size === 0) {
      throw new TypeError('No entity managers are tracked');
    }

    let trackingRecords = Array.from(this.entityFinders.values()).map(builder => builder.build());
    return new EntityTracker(
        this.trackee,
        this.samplingRadius,
        trackingRecords,
        this.existenceSystemsFinisher);
  }

  private getTrackingRecordBuilder<T>(
      entityFinder: EntityFinder<T>): OneEntityFinderToManySystemsRecordBuilder<T> {
    let trackingRecordBuilder =
        this.entityFinders.get(entityFinder) as OneEntityFinderToManySystemsRecordBuilder<T>;
    if (trackingRecordBuilder === undefined) {
      trackingRecordBuilder = new OneEntityFinderToManySystemsRecordBuilder(
          entityFinder, this.existenceSystemsFinisher);
      this.entityFinders.set(entityFinder, trackingRecordBuilder);
    }

    return trackingRecordBuilder;
  }
}

export default EntityTrackerBuilder;

class OneEntityFinderToManySystemsRecordBuilder<T> {
  constructor(
      private entityFinder: EntityFinder<T>,
      private existenceSystemsFinisher: ExistenceSystemsFinisher,
      private existenceSystems: Array<ExistenceSystem<T>> = [],
      private tickSystems: Array<TickSystem<T>> = []) {
  }

  addExistenceSystem(system: ExistenceSystem<T>) {
    this.existenceSystems.push(system);
    return this;
  }

  addTickSystem(system: TickSystem<T>) {
    this.tickSystems.push(system);
    return this;
  }

  build() {
    let entityFinderRecord = new EntityFinderRecord<T>(this.entityFinder, null);
    return new OneEntityFinderToManySystemsRecord(
        entityFinderRecord,
        this.existenceSystems,
        this.tickSystems,
        this.existenceSystemsFinisher);
  }
}
