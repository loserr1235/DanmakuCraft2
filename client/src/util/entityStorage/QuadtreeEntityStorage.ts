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
import {StateChanged} from './EntityFinder';
import EntityStorage from './EntityStorage';

class QuadtreeEntityStorage<T extends StationaryEntity> implements EntityStorage<T> {
  constructor(
      private readonly tree: Quadtree<T>,
      readonly onStateChanged = new Phaser.Signal<StateChanged<T>>()) {
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
    const [addedChunks, removedChunks] =
        provider().map(chunks => asSequence(chunks).flatten().toArray());
    if (addedChunks.length > 0 || removedChunks.length > 0) {
      this.onStateChanged.dispatch(new StateChanged(addedChunks, removedChunks));
    }
  }
}

export default QuadtreeEntityStorage;
