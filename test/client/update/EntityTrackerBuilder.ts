import {expect} from 'chai';
import {asSequence} from 'sequency';
import {instance, mock, when} from 'ts-mockito';
import VisibilityEngineBuilder from '../../../client/src/engine/visibility/VisibilityEngineBuilder';
import Entity from '../../../client/src/entitySystem/Entity';
import MoveDisplaySystem from '../../../client/src/entitySystem/system/tick/MoveDisplaySystem';
import TickSystem from '../../../client/src/entitySystem/system/tick/TickSystem';
import BackgroundColorSystem from '../../../client/src/entitySystem/system/visibility/BackgroundColorSystem';
import VisibilitySystem from '../../../client/src/entitySystem/system/visibility/VisibilitySystem';
import {Phaser} from '../../../client/src/util/alias/phaser';
import DynamicProvider from '../../../client/src/util/DynamicProvider';
import EntityFinder from '../../../client/src/util/entityStorage/EntityFinder';
import QuadtreeEntityStorage from '../../../client/src/util/entityStorage/QuadtreeEntityStorage';
import Point from '../../../client/src/util/syntax/Point';

xdescribe('VisibilityEngineBuilder', () => {
  let builder: VisibilityEngineBuilder;
  let mockTrackee: Entity;
  let mockEntityFinders: Array<EntityFinder<Entity>>;
  let entityFinders: Array<EntityFinder<Entity>>;
  let mockVisibilitySystems: Array<VisibilitySystem<Entity>>;
  let visibilitySystems: Array<VisibilitySystem<Entity>>;
  let mockTickSystems: TickSystem[];
  let tickSystems: TickSystem[];

  beforeEach(() => {
    mockTrackee = mock(Entity);
    mockTickSystems = [
      mock(MoveDisplaySystem),
      mock(MoveDisplaySystem),
      mock(MoveDisplaySystem),
      mock(MoveDisplaySystem)];
    tickSystems = mockTickSystems.map(instance);
    mockVisibilitySystems = [
      mock(BackgroundColorSystem),
      mock(BackgroundColorSystem),
      mock(BackgroundColorSystem),
      mock(BackgroundColorSystem)];
    visibilitySystems = mockVisibilitySystems.map(instance);
    mockEntityFinders = [
      mock(QuadtreeEntityStorage),
      mock(QuadtreeEntityStorage)];
    entityFinders = mockEntityFinders.map(instance);

    when(mockEntityFinders[0].onStateChanged).thenReturn(new Phaser.Signal());
    when(mockEntityFinders[1].onStateChanged).thenReturn(new Phaser.Signal());
    when(mockTrackee.coordinates).thenReturn(Point.origin());

    builder = new VisibilityEngineBuilder(instance(mockTrackee), new DynamicProvider(0))
        .applyTickSystem(tickSystems[0], false)
        .apply(visibilitySystems[0], entityFinders[1], false)
        .applyTickSystem(tickSystems[1], false)
        .apply(visibilitySystems[1], entityFinders[0], false)
        .applyTickSystem(tickSystems[2], true)
        .apply(visibilitySystems[2], entityFinders[1], true)
        .applyTickSystem(tickSystems[3], true)
        .apply(visibilitySystems[3], entityFinders[0], true);
  });

  it('should keeps system tickers in order', () => {
    const tracker = builder.build();

    const systems = asSequence([tracker['onUpdateSystemTickers'], tracker['onRenderSystemTickers']])
        .flatten()
        .map(ticker => (ticker as any)['system'])
        .toArray();
    expect(systems[0]).to.equal(tickSystems[2]);
    expect(systems[1]).to.equal(visibilitySystems[2]);
    expect(systems[2]).to.equal(tickSystems[3]);
    expect(systems[3]).to.equal(visibilitySystems[3]);
    expect(systems[4]).to.equal(tickSystems[0]);
    expect(systems[5]).to.equal(visibilitySystems[0]);
    expect(systems[6]).to.equal(tickSystems[1]);
    expect(systems[7]).to.equal(visibilitySystems[1]);
  });

  it('should create exactly one record for each entity finder', () => {
    const tracker = builder.build();

    const actualEntityFinders = asSequence(tracker['entityFinderRecords'])
        .map(record => record['entityFinder'])
        .toArray();
    expect(actualEntityFinders).to.have.members(entityFinders);
    expect(entityFinders).to.have.members(actualEntityFinders);
  });
});
