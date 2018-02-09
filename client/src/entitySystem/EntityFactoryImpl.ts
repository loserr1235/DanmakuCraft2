import EntityFactory from './EntityFactory';
import {UpdatingCommentEntity} from './alias';
import CommentData from '../comment/CommentData';
import Comment from './component/Comment';
import Entity from './Entity';
import ImmutableCoordinates from './component/ImmutableCoordinates';
import BuffFactory from './system/buff/BuffFactory';
import UpdatingBuffCarrier from './component/UpdatingBuffCarrier';
import MutableCoordinates from './component/MutableCoordinates';
import Motion from './component/Motion';
import Display from './component/Display';
import MovingAnimation from './component/MovingAnimation';
import GraphicsFactory from '../render/graphics/GraphicsFactory';
import Point from '../util/syntax/Point';
import SetContainer from '../util/entityStorage/chunk/SetContainer';
import Chest from './component/Chest';
import {Phaser, PIXI} from '../util/alias/phaser';
import ImmutableContainer from '../util/entityStorage/ImmutableContainer';
import RegisteredTimes from './component/RegisteredTimes';
import Blink from './component/Blink';
import Nudge from './component/Nudge';

class EntityFactoryImpl implements EntityFactory {
  constructor(
      private game: Phaser.Game,
      private graphicsFactory: GraphicsFactory,
      private buffFactory: BuffFactory) {
  }

  createRegion<T>(
      coordinates: Point,
      container: ImmutableContainer<T> = new SetContainer<T>(),
      display: PIXI.DisplayObjectContainer = new PIXI.DisplayObjectContainer()) {
    return Entity.newBuilder()
        .mix(new ImmutableCoordinates(coordinates))
        .mix(container)
        .mix(new Display(display))
        .build();
  }

  createCommentEntity(data: CommentData) {
    return this.createCommentEntityBuilder(data).build();
  }

  createPlayer(coordinates: Point) {
    return this.createTinyTelevision(coordinates);
  }

  createTinyTelevision(coordinates: Point) {
    let view = this.graphicsFactory.createTinyTelevision();
    let entity = Entity.newBuilder()
        .mix(new MutableCoordinates(coordinates))
        .mix(new Motion())
        .mix(new Display(view.display))
        .mix(new MovingAnimation(view.walkingAnimation))
        .mix(new UpdatingBuffCarrier())
        .mix(new Nudge())
        .build();

    this.buffFactory.createInputControllerMover().apply(entity);

    return entity;
  }

  createUpdatingCommentEntity(data: CommentData) {
    return this.createCommentEntityBuilder(data)
        .mix(new UpdatingBuffCarrier<UpdatingCommentEntity>())
        .build();
  }

  private createCommentEntityBuilder(data: CommentData) {
    let comment = new Comment(data.size, data.color, data.text);
    return Entity.newBuilder()
        .mix(new ImmutableCoordinates(data.coordinates))
        .mix(comment)
        .mix(new Display(this.graphicsFactory.createTextFromComment(comment)))
        .mix(new RegisteredTimes())
        .mix(new Blink());
  }

  createChest(coordinates: Point) {
    return Entity.newBuilder()
        .mix(new ImmutableCoordinates(coordinates))
        .mix(new Display(this.graphicsFactory.createChest()))
        .mix(new Chest())
        .build();
  }

  createPointEntity(coordinates: Point) {
    return Entity.newBuilder().mix(new ImmutableCoordinates(coordinates)).build();
  }

  createSignEntity(coordinates: Point, display: PIXI.DisplayObjectContainer) {
    return Entity.newBuilder()
        .mix(new ImmutableCoordinates(coordinates))
        .mix(new Display(display))
        .build();
  }
}

export default EntityFactoryImpl;
