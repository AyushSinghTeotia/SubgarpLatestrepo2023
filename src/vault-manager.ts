import {
    VaultUpdated
} from "../generated/VaultManager/VaultManager"
import { Vault, VaultHistory } from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts";

export function handleVaultUpdated(event: VaultUpdated): void {
    let entity = Vault.load(event.params._borrower);
    if (!entity) {
        entity = new Vault(event.params._borrower)
        entity.transactionNo = BigInt.fromI32(0);
        entity.coll = event.params._coll;
        entity.debt = event.params._debt;
        if (event.params.operation == 1 || event.params.operation == 2) {
            entity.status = "CLOSED";
        }
        else
            entity.status = "OPEN";
    } {
        if (event.params.operation == 1 || event.params.operation == 2) {
            entity.status = "CLOSED";
            entity.transactionNo = entity.transactionNo.plus(BigInt.fromI32(1))
            let entity2 = new VaultHistory(event.params._borrower.toHexString() + "-" + entity.transactionNo.toString());
            entity2.action = "Vault Liquidated";
            entity2.txn = event.transaction.hash;
            entity2.address = event.params._borrower;
            entity2.timestamp = event.block.timestamp;
            entity2.currentDebt = BigInt.fromI32(0);
            entity2.currentColl = BigInt.fromI32(0);
            entity2.save();
        }
        else
            entity.status = "OPEN";
    }
    entity.save();
}