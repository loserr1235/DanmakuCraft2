import Comment from '../../entitySystem/component/Comment';
import Point from '../../util/syntax/Point';
import Colors from '../Colors';
import TextShadowStyle from '../TextShadowStyle';
import ChestBuilder from './ChestBuilder';
import GraphicsFactory, {NotifierView, PlayerView} from './GraphicsFactory';
import PixelParticleBuilder from './PixelParticleBuilder';
import SpeechBubbleBuilder from './SpeechBubbleBuilder';
import TinyTelevisionBuilder from './TinyTelevisionBuilder';

class GraphicsFactoryImpl implements GraphicsFactory {
  private static readonly TEXT_SHADOW_GLOW_BLUR = 2;
  private static readonly TEXT_SHADOW_GLOW_THICKNESS = .75;
  private static readonly TEXT_SHADOW_DROP_BLUR = 1.5;
  private static readonly TEXT_SHADOW_DROP_THICKNESS = 1.25;

  private static readonly DEFAULT_FONT_WEIGHT = 'normal';

  constructor(
      private game: Phaser.Game,
      private idGenerator: Phaser.RandomDataGenerator,
      private fontFamily: string,
      private textShadowStyle: TextShadowStyle,
      private tinyTelevisionSpriteSheet: string | null = null,
      private chestSpriteSheet: string | null = null) {
  }

  createTextFromComment(comment: Comment) {
    const color = Phaser.Color.getWebRGB(comment.color);
    const text = this.createText(comment.text, comment.size, color);
    text.anchor.setTo(0.5);
    return text;
  }

  createText(
      text: string,
      size: number,
      color: string,
      fontFamily: string = this.fontFamily,
      textShadowStyle: TextShadowStyle = this.textShadowStyle,
      maxLines: number = 0) {
    const textDisplay = this.game.make.text(
        0,
        0,
        text,
        {
          fontWeight: GraphicsFactoryImpl.DEFAULT_FONT_WEIGHT,
          fontSize: size,
          fill: color,
          maxLines
        });
    textDisplay.font = fontFamily;  // Too lame to parse quoted font-family.

    switch (textShadowStyle) {
      case TextShadowStyle.GLOW:
      case TextShadowStyle.OUTLINE:
        textDisplay.setShadow(0, 0, Colors.BLACK, GraphicsFactoryImpl.TEXT_SHADOW_GLOW_BLUR);
        textDisplay.strokeThickness = GraphicsFactoryImpl.TEXT_SHADOW_GLOW_THICKNESS;
        break;
        // TODO too ugly
        // case TextShadowStyle.OUTLINE:
        //   textDisplay.setShadow(0, 0, Colors.BLACK, 1, false);
        //   textDisplay.strokeThickness = 2;
        //   break;
      case TextShadowStyle.DROP:
        textDisplay.setShadow(1, 1, Colors.DARK_GREY, GraphicsFactoryImpl.TEXT_SHADOW_DROP_BLUR);
        textDisplay.strokeThickness = GraphicsFactoryImpl.TEXT_SHADOW_DROP_THICKNESS;
        break;
      case TextShadowStyle.NONE:
      default:
        break;
    }

    return textDisplay;
  }

  createTinyTelevision() {
    if (this.tinyTelevisionSpriteSheet == null) {
      this.tinyTelevisionSpriteSheet = this.createTinyTelevisionSpriteSheet();
    }
    const sprite = this.createSprite(this.tinyTelevisionSpriteSheet);
    sprite.anchor.setTo(0.5, 0.7);

    const walkingAnimation = sprite.animations.add('', undefined, 12, true);

    return new PlayerView(sprite, walkingAnimation);
  }

  createChest() {
    if (this.chestSpriteSheet == null) {
      this.chestSpriteSheet = this.createChestSpriteSheet();
    }
    return this.createSprite(this.chestSpriteSheet);
  }

  createSpeechBubble() {
    const speechBubble = new SpeechBubbleBuilder(this.game, this.idGenerator)
        .pushFrame(0).withScale(1.7).withShadow()
        .toGraphics();

    const TEXT_BOUNDS_WIDTH = 165;
    const textField = this.createText('', 18, Colors.BLACK, undefined, TextShadowStyle.NONE, 4)
        .setTextBounds(0, 0, TEXT_BOUNDS_WIDTH, 120);
    textField.fontWeight = 'bold';
    textField.wordWrap = true;
    textField.boundsAlignH = 'center';
    textField.boundsAlignV = 'middle';

    speechBubble.addChild(textField);
    textField.position = Point.of(0, 10);

    return new NotifierView(speechBubble, textField, TEXT_BOUNDS_WIDTH);
  }

  createWorldCenterSign(size: number, color: string) {
    const container = new PIXI.DisplayObjectContainer();
    const upArrow = this.createText('⬆', 94, color);
    const downArrow = this.createText('⬇', 94, color);
    const leftArrow = this.createText('⬅', 94, color);

    const rightArrow = this.createText('⬅', 94, color);
    rightArrow.scale.x = -1;

    const bullet = this.createText('•', 94 / 2, color);

    container.addChild(bullet);
    bullet.anchor.setTo(0.5);

    container.addChild(upArrow);
    upArrow.anchor.setTo(0.5, 0);
    upArrow.position.y = size / 4;

    container.addChild(downArrow);
    downArrow.anchor.setTo(0.5, 1);
    downArrow.position.y = -size / 4;

    container.addChild(leftArrow);
    leftArrow.anchor.setTo(0, 0.5);
    leftArrow.position.x = size / 4;

    container.addChild(rightArrow);
    rightArrow.anchor.setTo(0, 0.5);
    rightArrow.position.x = -size / 4;

    return container;
  }

  createWorldOriginSign(size: number, color: string) {
    const display = this.createText('O ', 94, color);
    display.addFontStyle('italic', 0);

    return display;
  }

  createPixelParticleSpriteSheet(color: number = Colors.BACKGROUND_NUMBER, size: number = 4) {
    return new PixelParticleBuilder(this.game, this.idGenerator, color, size)
        .pushFrame(0)
        .toSpriteSheet();
  }

  private createTinyTelevisionSpriteSheet() {
    return new TinyTelevisionBuilder(this.game, this.idGenerator)
        .pushFrame(0).withShadow()
        .pushFrame(1).withShadow()
        .pushFrame(2).withShadow()
        .toSpriteSheet();
  }

  private createChestSpriteSheet() {
    return new ChestBuilder(this.game, this.idGenerator)
        .pushFrame(0).withShadow()
        .pushFrame(1).withShadow()
        .toSpriteSheet();
  }

  private createSprite(spriteSheet: string, initialFrameIndex: number | string = 0) {
    const sprite = this.game.make.sprite(0, 0, spriteSheet, initialFrameIndex);

    sprite.anchor.setTo(0.5);

    return sprite;
  }
}

export default GraphicsFactoryImpl;
