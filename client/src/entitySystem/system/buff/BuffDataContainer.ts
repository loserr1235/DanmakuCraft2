import {BuffData} from './BuffData';

class BuffDataContainer {
  constructor(private maxBuffDatasCount = 1, private buffDatas: BuffData[] = []) {
  }

  add(buffData: BuffData) {
    this.buffDatas.push(buffData);
    if (this.buffDatas.length > this.maxBuffDatasCount) {
      this.buffDatas.shift();
    }
  }

  hasBuff() {
    return this.buffDatas.length !== 0;
  }

  pop(): void {
    const buff = this.buffDatas.shift();
    if (!buff) {
      throw new Error('No buff data available');
    }
  }

  peek(defaultData: BuffData): BuffData {
    if (this.hasBuff()) {
      return this.buffDatas[0];
    }
    if (defaultData) {
      return defaultData;
    }
    throw new Error('No buff data available');
  }
}

export default BuffDataContainer;
