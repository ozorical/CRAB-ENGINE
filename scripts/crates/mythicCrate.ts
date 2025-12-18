import { world, ItemStack, Player, EntityComponentTypes, EquipmentSlot } from "@minecraft/server";
import { getRandomInt } from "../helperFunctions/randomInt";
import { MinecraftDimensionTypes } from "@minecraft/vanilla-data";

export function mythicCrate(player: Player) {
  let heldItem = player.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Mainhand);
  if (heldItem?.typeId == "crab:mythic_key") {
    const drop = getRandomInt(1, 5);
    world.structureManager.place(`MythicReward${drop}`, player.dimension, { x: player.location.x, y: player.location.y + 1, z: player.location.z });
    player.sendMessage("§l§8>> §r§fYou Opened A §dMythic Crate");
    // eslint-disable-next-line minecraft-linting/avoid-unnecessary-command
    player.runCommand("summon fireworks_rocket");
    world.getDimension(MinecraftDimensionTypes.Overworld).spawnParticle("crab:open", player.location);
    world.getDimension(MinecraftDimensionTypes.Overworld).playSound("random.totem", player.location);
    if (heldItem.amount != 1) {
      heldItem.amount -= 1;
      player.getComponent(EntityComponentTypes.Equippable)?.getEquipmentSlot(EquipmentSlot.Mainhand).setItem(heldItem);
    } else if (heldItem.amount == 1) {
      player.getComponent(EntityComponentTypes.Equippable)?.getEquipmentSlot(EquipmentSlot.Mainhand).setItem(new ItemStack("minecraft:air"));
    }
  } else {
    player.sendMessage("§cCannot Open: You Are Not Holding A §dMythic Key");
    player.playSound("beacon.deactivate");
  }
}
