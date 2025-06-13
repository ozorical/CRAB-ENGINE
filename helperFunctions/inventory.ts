"use strict";

/**
 * @module InventoryFunctions
 */

import { ItemStack, Player, system } from "@minecraft/server";

/**
 * Gives an item to a player, handling inventory full cases and large quantities
 * @param {Player} player - The player to give the item to
 * @param {string} item - The item ID/type
 * @param {number} [amount=1] - Amount of items to give (optional)
 * @param {string} [name] - Custom name for the item (optional)
 * @throws {Error} If invalid parameters are provided
 */
export function giveItem(player: Player, item: string, amount = 1, name: string) {
  if (!player || !(player instanceof Player)) {
    throw new Error("Invalid player");
  }
  if (!item || typeof item !== "string") {
    throw new Error("Invalid item");
  }
  if (amount && (typeof amount !== "number" || amount < 1)) {
    throw new Error("Amount must be a positive number");
  }
  if (name && typeof name !== "string") {
    throw new Error("Name must be a string");
  }

  const invComponent = player.getComponent("inventory");
  if (invComponent) {
    const container = invComponent.container;
    if (container) {
      system.run(() => {
        let remainingAmount = amount;
        let itemsGiven = 0;
        let itemsDropped = 0;

        while (remainingAmount > 0) {
          const stackSize = Math.min(remainingAmount, 64);
          const i = new ItemStack(item, stackSize);
          if (name) i.nameTag = name;

          const itemRemainder = container.addItem(i);

          if (itemRemainder) {
            player.dimension.spawnItem(itemRemainder, player.location);
            itemsDropped += itemRemainder.amount;
            break;
          } else {
            itemsGiven += stackSize;
          }

          remainingAmount -= stackSize;
        }

        if (remainingAmount > 0) {
          const remainderStack = new ItemStack(item, remainingAmount);
          if (name) remainderStack.nameTag = name;
          player.dimension.spawnItem(remainderStack, player.location);
          itemsDropped += remainingAmount;
        }

        if (itemsDropped > 0) {
          player.sendMessage(`§a§cYour inventory was full, so ${itemsDropped}x ${item} were dropped at your location.`);
        }
      });
    }
  }
}
