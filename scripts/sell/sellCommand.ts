import { Player, EntityComponentTypes, EntityInventoryComponent } from "@minecraft/server";
import { prices } from "./prices";
import { addScore } from "../helperFunctions/getScore";
import { CRABSCORES } from "../enums";
import { relay } from "../protocol/protocol";

export function sell(player: Player) {
  let inventory: EntityInventoryComponent = player.getComponent(EntityComponentTypes.Inventory)!;
  let totalMade: number = 0;
  for (let slot = 0; slot <= inventory.container?.size!; slot++) {
    let itemName = inventory.container?.getItem(slot);

    if (itemName != undefined) {
      const name = itemName.typeId;

      const amount = itemName.amount;

      prices.forEach((price) => {
        if (name == price.name) {
          addScore(player, price.name, amount);
          totalMade += amount * price.price;
          inventory.container?.setItem(slot, undefined);
        }
      });
    }

    if (slot == 35) {
      player.sendMessage(`§fYou sold items and earned §a$${totalMade}`);
      relay(`[Shop] ${player.name} made ${totalMade} from selling items`);
      player.runCommand(`summon fireworks_rocket`);
      addScore(player, CRABSCORES.money, totalMade);
      return;
    }
  }
}
