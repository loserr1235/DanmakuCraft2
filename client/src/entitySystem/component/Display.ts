import {PIXI} from '../../util/alias/phaser';
import Entity from '../Entity';

class Display<T = PIXI.DisplayObjectContainer> {
  constructor(public display: T) {
  }

  static getWorldBounds(display: PIXI.DisplayObjectContainer, relativeTo: Entity) {
    return display.getLocalBounds().clone().offsetPoint(relativeTo.coordinates);
  }

  getDisplayWorldBounds(this: Entity & Display<PIXI.DisplayObjectContainer>) {
    return Display.getWorldBounds(this.display, this);
  }
}

export default Display;
