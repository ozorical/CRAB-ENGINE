import { Player, Block, EntityComponentTypes, EquipmentSlot, BlockInventoryComponent, BlockComponentTypes, EntityHitBlockAfterEvent } from "@minecraft/server";
import { prices } from "./prices";
import { addScore } from "../helperFunctions/getScore";

import { CRABSCORES } from "../enums";
import { relay } from "../protocol/protocol";

export function sellWandHitBlock(e: EntityHitBlockAfterEvent) {
  let player = e.damagingEntity as Player;
  let block: Block = e.hitBlock;

  if (player.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Mainhand)?.typeId == "alpha:sellwand") {
    let inventory: BlockInventoryComponent = block.getComponent(BlockComponentTypes.Inventory)!;
    let totalMade: number = 0;
    for (let slot = 0; slot <= inventory.container?.size!; slot++) {
      let itemName = inventory.container?.getItem(slot);

      if (itemName != undefined) {
        let itemName = inventory.container?.getSlot(slot);
        const name = itemName?.typeId;

        const amount = itemName?.amount;

        prices.forEach((price) => {
          if (name!.replace("minecraft:", "") == price.name) {
            addScore(player, price.name, amount!);
            totalMade += amount! * price.price;
            inventory.container?.setItem(slot, undefined);
          }
        });
      }

      if (slot == inventory.container?.size! - 1) {
        player.sendMessage(`§fYou made §a$${totalMade}!`);
        player.runCommand(`summon fireworks_rocket`);
        relay(`[Shop] ${player.name} made ${totalMade} from the sell wand`);
        addScore(player, CRABSCORES.money, totalMade);
        return;
      }
    }
  }
}
