import { BigInt } from "@graphprotocol/graph-ts";
import {
  VaultCreated,
  VaultUpdated,
} from "../generated/BorrowerOperations/BorrowerOperations"
import { Vault, VaultHistory } from "../generated/schema"

export function handleVaultCreated(event: VaultCreated): void {
  let entity1 = Vault.load(event.params._borrower);
  if (!entity1) {
    entity1 = new Vault(event.params._borrower);
    entity1.transactionNo = BigInt.fromI32(0);
    entity1.status = "OPEN";
  }
  entity1.save();
}

export function handleVaultUpdated(event: VaultUpdated): void {
  let entity = Vault.load(event.params._borrower);
  if (!entity) {
    entity = new Vault(event.params._borrower)
    entity.transactionNo = BigInt.fromI32(0);
    entity.coll = event.params._coll;
    entity.debt = event.params._debt;
    if (event.params.operation == 1)
      entity.status = "CLOSED";
    else
      entity.status = "OPEN";
  }
  entity.coll = event.params._coll;
  entity.debt = event.params._debt;
  if (event.params.operation == 1)
    entity.status = "CLOSED";
  else
    entity.status = "OPEN";
  entity.save();
  // let entity2 = VaultHistory.load(event.transaction.hash);
  let vault = Vault.load(event.params._borrower);
  if (vault) {
    vault.transactionNo = vault.transactionNo.plus(BigInt.fromI32(1));
    vault.save();
    let entity2 = new VaultHistory(event.params._borrower.toHexString() + "-" + vault.transactionNo.toString());
    entity2.txn = event.transaction.hash;
    entity2.address = event.params._borrower;
    entity2.timestamp = event.block.timestamp;
    if (event.params.operation == 0) {
      entity2.action = "Vault Created";
      entity2.debtChanged = new BigInt(0);
      entity2.collChanged = new BigInt(0);
    }
    else if (event.params.operation == 1) {
      entity2.action = "Vault Closed";
      entity2.debtChanged = new BigInt(0);
      entity2.collChanged = new BigInt(0);
    }
    else {
      let vault1 = Vault.load(event.params._borrower);
      if (vault1) {
        let no = vault1.transactionNo.minus(BigInt.fromI32(1));
        let oldVaultHistory = VaultHistory.load(event.params._borrower.toHexString() + "-" + no.toString())
        if (oldVaultHistory) {
          if (oldVaultHistory.currentDebt.gt(event.params._debt) && oldVaultHistory.currentColl.equals(event.params._coll)) {
            entity2.debtChanged = oldVaultHistory.currentDebt.minus(event.params._debt);
            entity2.collChanged = BigInt.fromI32(0);
            entity2.action = "Debt Repaid";
          }
          if (oldVaultHistory.currentDebt.lt(event.params._debt) && oldVaultHistory.currentColl.equals(event.params._coll)) {
            entity2.debtChanged = event.params._debt.minus(oldVaultHistory.currentDebt);
            entity2.collChanged = BigInt.fromI32(0);
            entity2.action = "Debt Borrowed";
          }
          if (oldVaultHistory.currentColl.gt(event.params._coll) && oldVaultHistory.currentDebt.equals(event.params._debt)) {
            entity2.collChanged = oldVaultHistory.currentColl.minus(event.params._coll);
            entity2.debtChanged = BigInt.fromI32(0);
            entity2.action = "Collateral Withdrawn";
          }
          if (oldVaultHistory.currentColl.lt(event.params._coll) && oldVaultHistory.currentDebt.equals(event.params._debt)) {
            entity2.collChanged = event.params._coll.minus(oldVaultHistory.currentColl)
            entity2.debtChanged = BigInt.fromI32(0);
            entity2.action = "Collateral Added";
          }
          if (oldVaultHistory.currentColl.lt(event.params._coll) && oldVaultHistory.currentDebt.lt(event.params._debt)) {
            entity2.collChanged = event.params._coll.minus(oldVaultHistory.currentColl)
            entity2.currentDebt = event.params._debt.minus(oldVaultHistory.currentDebt)
            entity2.action = "Vault Adjusted";
          }
        }
      }
    }
    entity2.currentDebt = event.params._debt;
    entity2.currentColl = event.params._coll;
    entity2.save();
  }
}
