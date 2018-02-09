import Iterator from '../../syntax/Iterator';
import ImmutableContainer from '../ImmutableContainer';

class SetContainer<T> implements ImmutableContainer<T> {
  constructor(private values: Set<T> = new Set()) {
  }

  add(item: T) {
    let newItems = new Set(this.values);
    newItems.add(item);

    return new SetContainer(newItems);
  }

  count() {
    return this.values.size;
  }

  [Symbol.iterator]() {
    return Iterator.of(this.values);
  }
}

export default SetContainer;
