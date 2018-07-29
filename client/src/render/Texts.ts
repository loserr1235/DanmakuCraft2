class Texts {
  static forName(name: string): string {
    const text = TEXTS[name];
    if (!text) {
      throw new Error(`Text '${name}' not found`);
    }

    return text;
  }
}

const TEXTS: { [textName: string]: string } = {
  'boot.anyInput': '按任意键开始游戏',
  'boot.done': '加载完毕',
  'boot.error': '加载失败，请刷新页面',
  'boot.loading': '加载中',
  'boot.title': '弹幕世界2',

  'main.tutorial.movement.first': '注意到我身子底下两个凸起了吗？那是我的腿',
  'main.tutorial.movement.second': '我可是会走路的哦',
  'main.tutorial.movement.final': '按方向键移动', // TODO update for pointer
  'main.tutorial.comment': '快捷键：按回车开始发弹幕',

  'main.buff.description.none': '我捡到了……一团空气',
  'main.buff.description.chromatic': '下一条弹幕一定会很绚丽',
  'main.buff.description.hasty': '现在我健步如飞了！',

  'main.comment.insert.collision': '和别的弹幕靠的太近了',

  'main.error.server': '通讯被干扰，请刷新或稍后再试',
};

export default Texts;
