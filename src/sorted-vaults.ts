import {
    NodeAdded,
    NodeRemoved
} from "../generated/SortedVaults/SortedVaults"
import { Vault } from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts";

export function handleNodeAdded(event: NodeAdded): void {
    let entity = Vault.load(event.params._id);
    if (!entity) {
        entity = new Vault(event.params._id)
        entity.NICR = event.params._NICR;
        entity.transactionNo = new BigInt(0);
        entity.coll = new BigInt(0)
        entity.debt = new BigInt(0)
    }
    entity.NICR = event.params._NICR;
    entity.save();
}

export function handleNodeRemoved(event: NodeRemoved): void {
    let entity = Vault.load(event.params._id);
    if (entity) {
        if (entity.status != "CLOSED")
            entity.status = "CLOSED";
        entity.save();
    }
}