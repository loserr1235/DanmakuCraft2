import Motion from '../../component/Motion';
import TimedBuff from './TimedBuff';
import PhysicalConstants from '../../../PhysicalConstants';

class Hasty extends TimedBuff<Motion> {
  constructor(private boostBoostRatioRatio: number = PhysicalConstants.HASTY_BOOST_RATIO) {
    super(PhysicalConstants.CHEST_SPAWN_COOLDOWN * 0.9);
  }

  protected set(motion: Motion) {
    motion.moveSpeedBoostRatio *= this.boostBoostRatioRatio;
  }

  protected update(component: Motion, time: Phaser.Time) {
  }

  protected unset(motion: Motion) {
    motion.moveSpeedBoostRatio /= this.boostBoostRatioRatio;
  }
}

export default Hasty;
