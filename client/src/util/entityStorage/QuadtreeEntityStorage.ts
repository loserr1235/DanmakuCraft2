import {asSequence} from 'sequency';
import {Region, StationaryEntity} from '../../entitySystem/alias';
import {validateRadius} from '../../law/space';
import PhysicalConstants from '../../PhysicalConstants';
import {Phaser} from '../alias/phaser';
import Quadtree from '../dataStructures/Quadtree';
import Iterator from '../syntax/Iterator';
import Point from '../syntax/Point';
import Provider from '../syntax/Provider';
import Rectangle from '../syntax/Rectangle';
import EntityStorage from './EntityStorage';

class QuadtreeEntityStorage<T extends StationaryEntity> implements EntityStorage<T> {
  constructor(
      private readonly tree: Quadtree<T>,
      readonly onEntitiesRegistered = new Phaser.Signal<ReadonlyArray<T>>(),
      readonly onEntitiesDeregistered = new Phaser.Signal<ReadonlyArray<T>>()) {
  }

  static create<T extends StationaryEntity>(
      maxValuesCount: number = PhysicalConstants.QUADTREE_MAX_VALUES_COUNT,
      maxDepth: number = PhysicalConstants.QUADTREE_MAX_DEPTH) {
    const tree = Quadtree.empty<T>(maxValuesCount, maxDepth);
    return new QuadtreeEntityStorage(tree);
  }

  listAround(coordinates: Point, radius: number) {
    validateRadius(radius);

    const bounds = Rectangle.inflateFrom(coordinates, radius);
    return this.tree.listIn(bounds);
  }

  register(entity: T) {
    this.dispatchUpdatesOfChunks(() => this.tree.add(entity));
  }

  registerBatch(entities: Iterable<T>) {
    this.dispatchUpdatesOfChunks(() => this.tree.addBatch(entities));
  }

  deregister(entity: T) {
    this.dispatchUpdatesOfChunks(() => this.tree.remove(entity));
  }

  [Symbol.iterator]() {
    return Iterator.of(this.tree);
  }

  private dispatchUpdatesOfChunks(provider: Provider<[Iterable<Region<T>>, Iterable<Region<T>>]>) {
    const [registeredEntities, deregisteredEntities] =
        provider().map(chunks => asSequence(chunks).flatten().toArray());
    if (registeredEntities.length) {
      this.onEntitiesRegistered.dispatch(registeredEntities);
    }
    if (deregisteredEntities.length) {
      this.onEntitiesDeregistered.dispatch(deregisteredEntities);
    }
  }
}

export default QuadtreeEntityStorage;
