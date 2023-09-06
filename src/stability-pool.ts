import {
    DistributeReward,
    ETHGainWithdrawn,
    ASSETFeeCharged
} from "../generated/StabilityPool/StabilityPool"
import { UserReward, DepositorRewardHistory } from "../generated/schema"

export function handleDistributeReward(event: DistributeReward): void {
    let entity1 = UserReward.load(event.params._account);
    if (!entity1) {
        entity1 = new UserReward(event.params._account);
        entity1.assetRewarded = event.params._amount;
    } else
        entity1.assetRewarded = entity1.assetRewarded.plus(event.params._amount);
    entity1.save();
    let entity2 = DepositorRewardHistory.load(event.transaction.hash);
    if (!entity2) {
        entity2 = new DepositorRewardHistory(event.transaction.hash);
    }
    entity2.address = event.params._account;
    entity2.assetGain = event.params._amount;
    entity2.netAssetGain = event.params._amount;
    entity2.timestamp = event.block.timestamp;
    entity2.save();
}

export function handleETHGainWithdrawn(event: ETHGainWithdrawn): void {
    let entity = DepositorRewardHistory.load(event.transaction.hash);
    if (!entity) {
        entity = new DepositorRewardHistory(event.transaction.hash);
    }
    entity.address = event.params._depositor;
    entity.ethGain = event.params._ETH;
    entity.netEthGain = event.params._ETH;
    entity.timestamp = event.block.timestamp;
    entity.usdaoLoss = event.params._USDAOLoss;
    entity.save();
}
export function handleASSETFeeCharged(event: ASSETFeeCharged): void {
    let entity = DepositorRewardHistory.load(event.transaction.hash);
    if (!entity) {
        entity = new DepositorRewardHistory(event.transaction.hash);
    }
    entity.address = event.params._account;
    entity.fee = event.params._feeAmount;
    entity.timestamp = event.block.timestamp;
    entity.save();
}