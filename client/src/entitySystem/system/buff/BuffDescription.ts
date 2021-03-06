import {BuffData, BuffType} from './BuffData';
import Texts from '../../../render/Texts';

class BuffDescription {
  for(data: BuffData): string {
    switch (data.type) {
      case BuffType.NONE:
        return Texts.forName('main.buff.description.none');
      case BuffType.CHROMATIC:
        return Texts.forName('main.buff.description.chromatic');
      case BuffType.HASTY:
        return Texts.forName('main.buff.description.hasty');
      default:
        throw new TypeError(`Invalid buff data: ${data}`);
    }
  }
}

export default BuffDescription;
