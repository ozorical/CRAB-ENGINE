import { world, system, EntityInventoryComponent } from "@minecraft/server";
import { advancedRelay } from "../protocol/protocol";

// Define minerals needing logged
const minerals = new Set<string>([
  "minecraft:diamond",
  "minecraft:diamond_block",
  "minecraft:emerald",
  "minecraft:emerald_block",
  "minecraft:gold_ingot",
  "minecraft:gold_block",
  "minecraft:iron_ingot",
  "minecraft:iron_block",
  "minecraft:netherite_ingot",
  "minecraft:netherite_block",
  "minecraft:coal",
  "minecraft:coal_block",
  "minecraft:redstone",
  "minecraft:redstone_block",
  "minecraft:lapis_lazuli",
  "minecraft:lapis_block",
  "minecraft:copper_ingot",
  "minecraft:copper_block",
  "minecraft:raw_iron",
  "minecraft:raw_iron_block",
  "minecraft:raw_gold",
  "minecraft:raw_gold_block",
  "minecraft:raw_copper",
  "minecraft:raw_copper_block",
]);

// Store last known inventory states per player
const lastInventories = new Map<string, Map<string, number>>();

system.runInterval(() => {
  const players = world.getPlayers();
  for (const player of players) {
    const invComp = player.getComponent("minecraft:inventory") as EntityInventoryComponent | undefined;
    if (!invComp) continue;  
    
    const inv = invComp.container;
    const current = new Map<string, number>();
  
    for (let i = 0; i < inv.size; i++) {
      const item = inv.getItem(i);
      if (item && minerals.has(item.typeId)) {
        current.set(item.typeId, (current.get(item.typeId) || 0) + item.amount);
      }
    }

    const last = lastInventories.get(player.name) ?? new Map<string, number>();

    for (const [itemId, count] of current.entries()) {
      const previous = last.get(itemId) || 0;
      const delta = count - previous;

      if (delta > 0) {
        const itemName = itemId.replace("minecraft:", "").replaceAll("_", " ");
        advancedRelay(
          "1396939127122821222",
          `${player.name} picked up ${delta}x **${itemName}**`,
          "Mineral Obtained",
          "0097FF"
        );
      } 
    }

    lastInventories.set(player.name, current);
  }
}, 5);