import {Player} from './entity';

export class PlayerManager {
  // TODO spawn player
}

export class TinyTelevision extends Player {
  tick(): void {
    throw new Error('Method not implemented.');
  }

  display(): PIXI.Graphics {
    throw new Error('Method not implemented.');
  }
}
