import {Entity} from './entity';
import {EffectData, EffectFactory} from '../effect';
import SettingsManager from '../environment/SettingsManager';
import CommentProvider, {NewCommentEvent} from '../environment/CommentProvider';
import {UnaryEvent} from '../dispatcher';
import EntityManager from './EntityManager';
import {Superposed} from '../law';
import EntityTracker from '../update/entityTracker/EntityTracker';

export class CommentData {
  constructor(
      readonly size: number,
      readonly color: number,
      readonly sendTime: number,
      readonly userId: number,
      readonly text: string,
      readonly coordinateX: number, // These positions may be invalid.
      readonly coordinateY: number,
      readonly effectData: EffectData | null) {
  }
}

export class CommentManager {
  private fontFamily: string;

  constructor(
      private game: Phaser.Game,
      private entityManager: EntityManager<CommentEntity>,
      settingsManager: SettingsManager,
      private entityTracker: EntityTracker) {
    this.fontFamily = settingsManager.getSetting(SettingsManager.Options.FONT_FAMILY);
    settingsManager.addEventListener(
        SettingsManager.Options.FONT_FAMILY,
        (event: UnaryEvent<string>) => this.onFontChanged(event.getDetail()));
  }

  canPlaceIn(bound: Phaser.Rectangle): boolean {
    return !this.entityTracker.getCurrentRegions(this.entityManager)
        .some(region => {
          let hasCollision = false;
          region.forEach(commentEntity => {
            if (hasCollision) {
              return;
            }
            hasCollision = commentEntity.measure().textBounds.intersects(bound, 0);
          });

          return hasCollision;
        });
  }

  loadBatch(commentsData: CommentData[]) {
    let comments = commentsData.map(this.buildEntity, this);
    this.entityManager.loadBatch(comments);
    return comments;
  }

  load(commentData: CommentData) {
    let comment = this.buildEntity(commentData);
    this.entityManager.load(comment);
    return comment;
  }

  makeText(text: string, size: number, color: string): Phaser.Text {
    // TODO add font shadow
    return this.game.make.text(
        0,
        0,
        text,
        {
          font: this.fontFamily,
          fontSize: size,
          fill: color,
        });
  }

  private onFontChanged(fontFamily: string) {
    if (this.fontFamily === fontFamily) {
      return;
    }

    this.fontFamily = fontFamily;

    // TODO redraw all sprites?
  }

  listenTo(commentProvider: CommentProvider) {
    commentProvider.addEventListener(
        CommentProvider.NEW_COMMENT, event => this.onNewComment(event));
  }

  private buildEntity(data: CommentData) {
    let coordinate = new Phaser.Point(data.coordinateX, data.coordinateY);
    let comment = new CommentEntity(data.size, data.color, data.text, coordinate, this);

    if (data.effectData != null) {
      let effect = EffectFactory.build(data.effectData);
      effect.initialize(comment);
    }

    return comment;
  }

  private onNewComment(event: NewCommentEvent) {
    let commentData = event.getDetail();
    this.load(commentData);
  }
}

export interface Comment extends Superposed {
  readonly size: number;
  readonly color: number;
  readonly text: string;

  measure(): Phaser.Text;
}

export class CommentEntity extends Entity implements Comment {
  private display: Phaser.Text | null;

  constructor(
      readonly size: number,
      readonly color: number,
      readonly text: string,
      coordinate: Phaser.Point,
      private commentManager: CommentManager) {
    super(coordinate);
    this.display = null;
  }

  decohere(parentCoordinate: Phaser.Point): void {
    if (this.display != null) {
      throw new Error('CommentEntity is decoherent');
    }

    let color = Phaser.Color.getWebRGB(this.color); // TODO test if works?
    this.display = this.commentManager.makeText(this.text, this.size, color);
    this.display.anchor.setTo(0.5);
  }

  cohere(): void {
    if (this.display == null) {
      throw new Error('CommentEntity is coherent');
    }

    this.display = null;
  }

  measure(): Phaser.Text {
    if (this.display == null) {
      throw new Error('CommentEntity is coherent');
    }

    return this.display;
  }
}
