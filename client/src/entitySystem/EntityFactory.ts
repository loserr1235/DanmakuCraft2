import CommentData from '../comment/CommentData';
import {PIXI} from '../util/alias/phaser';
import ImmutableContainer from '../util/dataStructures/ImmutableContainer';
import Point from '../util/syntax/Point';
import {ChestEntity, CommentEntity, DisplayableRegion, Player, SignEntity, StationaryEntity, UpdatingCommentEntity} from './alias';

interface EntityFactory {
  createPlayer(coordinates: Point): Player;

  createCommentEntity(data: CommentData): CommentEntity;

  createUpdatingCommentEntity(data: CommentData): UpdatingCommentEntity;

  createRegion<T>(
      coordinates: Point,
      container?: ImmutableContainer<T>,
      display?: PIXI.DisplayObjectContainer): DisplayableRegion<T>;

  createChest(coordinates: Point): ChestEntity;

  createPointEntity(coordinates: Point): StationaryEntity;

  createSignEntity(coordinates: Point, display: PIXI.DisplayObjectContainer): SignEntity;
}

export default EntityFactory;
