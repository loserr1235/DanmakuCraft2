import Chromatic, {BouncingColorTransition} from './Chromatic';
import BuffFactory from './BuffFactory';
import Ethereal from './Ethereal';
import Controller from '../../../controller/Controller';
import Moving from './Moving';
import Hasty from './Hasty';
import LawFactory from '../../../law/LawFactory';

class BuffFactoryImpl implements BuffFactory {
  constructor(
      private game: Phaser.Game,
      private controller: Controller,
      private lawFactory: LawFactory,
      private etherealInstance: Ethereal = new Ethereal()) {
  }

  createEthereal() {
    return this.etherealInstance;
  }

  createInputControllerMover() {
    return new Moving(this.controller);
  }

  createWorldWanderingMover(): never {
    throw new Error('Not Implemented');
  }

  createChromatic() {
    return new Chromatic(
        new BouncingColorTransition(this.lawFactory.createColorTransitionLaw()),
        new BouncingColorTransition(this.lawFactory.createColorTransitionLaw()),
        new BouncingColorTransition(this.lawFactory.createColorTransitionLaw()));
  }

  createHasty() {
    return new Hasty();
  }
}

export default BuffFactoryImpl;
