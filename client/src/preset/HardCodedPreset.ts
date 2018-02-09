import Preset from './Preset';
import Point from '../util/syntax/Point';
import EntityFactory from '../entitySystem/EntityFactory';
import Entity from '../entitySystem/Entity';
import Colors from '../render/Colors';
import EntityRegister from '../util/entityStorage/EntityRegister';
import {SignEntity} from '../entitySystem/alias';
import GraphicsFactory from '../render/graphics/GraphicsFactory';
import Chain from '../util/dataGenerator/Chain';
import Scaler from '../util/dataGenerator/Scaler';
import SimpleDataGenerator from '../util/dataGenerator/SimpleDataGenerator';
import Const from '../util/dataGenerator/Const';
import Joining from '../util/dataGenerator/Joining';

class PresetPoint<T> {
  constructor(readonly x: number, readonly y: number, readonly data: T) {
  }

  get coordinates() {
    return Point.of(this.x, this.y);
  }
}

class HardCodedPreset implements Preset {
  private static readonly SIGN_SIZE = 94;

  private static readonly SPAWN_POINTS = [
    new PresetPoint(8424, 8586, '8'), // NW
    new PresetPoint(16362, 9396, '1'), // N
    new PresetPoint(24300, 8748, '6'), // NE
    new PresetPoint(8748, 16038, '3'), // W
    new PresetPoint(23652, 16524, '7'), // E
    new PresetPoint(9072, 23976, '4'), // SW
    new PresetPoint(16524, 23490, '⑨'), // S
    new PresetPoint(23976, 23814, '2')]; // SE

  private static readonly WORLD_CENTER_COORDINATES = Point.of(16200, 16200); // WORLD_SIZE was 32400
  private static readonly WORLD_ORIGIN_COORDINATES = Point.origin();

  private static readonly SPAWN_POINT_CHANGE_INTERVAL = 5 * Phaser.Timer.MINUTE + 17 * Phaser.Timer.SECOND;
  private static readonly SPAWN_COORDINATE_MAX_OFFSET = 675;

  constructor(private entityFactory: EntityFactory, private graphicsFactory: GraphicsFactory) {
  }

  getPlayerSpawnPoint() {
    if (__DEV__) {
      return HardCodedPreset.WORLD_CENTER_COORDINATES.clone();
    }

    let spawnPeriod = Math.floor(Date.now() / HardCodedPreset.SPAWN_POINT_CHANGE_INTERVAL);
    let spawnPointIndex = spawnPeriod % HardCodedPreset.SPAWN_POINTS.length;
    let spawnPoint = HardCodedPreset.SPAWN_POINTS[spawnPointIndex];

    let randomOffsets = Chain.total(Joining.of(
        Chain.total(new SimpleDataGenerator()).pipe(Scaler.to(0, Phaser.Math.PI2)).build(),
        Chain.total(new SimpleDataGenerator())
            .pipe(Scaler.to(0, HardCodedPreset.SPAWN_COORDINATE_MAX_OFFSET ** 2))
            .pipe(Const.of(Math.sqrt))
            .build()))
        .pipe(Const.of(([azimuth, radius]) => Point.ofPolar(azimuth, radius)))
        .build()
        .next();
    return spawnPoint.coordinates.add(randomOffsets.x, randomOffsets.y);
  }

  populateSpawnPoints(
      pointsRegister: EntityRegister<Entity>, signsRegister: EntityRegister<SignEntity>) {
    for (let point of HardCodedPreset.SPAWN_POINTS) {
      let pointEntity = this.entityFactory.createPointEntity(point.coordinates);
      pointsRegister.register(pointEntity);

      let display =
          this.graphicsFactory.createText(point.data, HardCodedPreset.SIGN_SIZE, Colors.GOLD);
      display.anchor.setTo(0.5);
      let signEntity = this.entityFactory.createSignEntity(pointEntity.coordinates, display);
      signsRegister.register(signEntity);
    }
  }

  populateSigns(signsRegister: EntityRegister<SignEntity>) {
    let worldCenter = this.entityFactory.createSignEntity(
        HardCodedPreset.WORLD_CENTER_COORDINATES,
        this.graphicsFactory.createWorldCenterSign(HardCodedPreset.SIGN_SIZE, Colors.GOLD));
    signsRegister.register(worldCenter);

    let worldOrigin = this.entityFactory.createSignEntity(
        HardCodedPreset.WORLD_ORIGIN_COORDINATES,
        this.graphicsFactory.createWorldOriginSign(HardCodedPreset.SIGN_SIZE, Colors.GOLD));
    signsRegister.register(worldOrigin);
  }
}

export default HardCodedPreset;
