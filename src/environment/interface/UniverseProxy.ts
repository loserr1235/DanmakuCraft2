import {Player} from '../../entitySystem/alias';
import BuffDataContainer from '../../comment/BuffDataContainer';

export default interface UniverseProxy {
  /**
   * Checks if the shape of {@param commentText} with {@param commentSize} can fit in its place.
   * Triggers some notification in game if request is rejected.
   */
  // TODO somehow trigger notification event: cannot place comment here. notification is generated by game itself.
  requestForPlacingComment(commentText: string, commentSize: number): boolean;

  getPlayer(): Player;

  getBuffDataContainer(): BuffDataContainer;
}
