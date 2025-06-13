import { world, ItemStack, system, EntityComponentTypes, EquipmentSlot, Player } from "@minecraft/server";
import { Database } from "../db/Database";
import { InvDB } from "../types";
import { setScore } from "../helperFunctions/getScore";
import { CRABTAGS } from "../enums";

let playerInventories: Database<Array<InvDB>>;

export const invDBInit = async () => {
  await null;
  playerInventories = new Database<Array<InvDB>>("inventories");
};

export function thisGuyCombatLogged(p: Player) {
  world.sendMessage(`§d${p.name} Tried To Leave While In Combat. They Were Cleared`);
  p.teleport({ x: 20031, y: 112, z: 20119 });
  p.removeTag(CRABTAGS.combat);
  setScore(p, "clog", 0);
  p.getComponent(EntityComponentTypes.Inventory)?.container?.clearAll();
  p.getComponent(EntityComponentTypes.Equippable)?.setEquipment(EquipmentSlot.Head, new ItemStack("minecraft:air"));
  p.getComponent(EntityComponentTypes.Equippable)?.setEquipment(EquipmentSlot.Chest, new ItemStack("minecraft:air"));
  p.getComponent(EntityComponentTypes.Equippable)?.setEquipment(EquipmentSlot.Feet, new ItemStack("minecraft:air"));
  p.getComponent(EntityComponentTypes.Equippable)?.setEquipment(EquipmentSlot.Legs, new ItemStack("minecraft:air"));
  p.getComponent(EntityComponentTypes.Equippable)?.setEquipment(EquipmentSlot.Offhand, new ItemStack("minecraft:air"));
}

export function inventorySnapshot(player: Player) {
  let playerInvs: Array<InvDB> = [];
  let eq: Array<ItemStack> = [];
  let items: Array<ItemStack> = [];
  let equipment = player.getComponent("equippable")!;
  let inventory = player.getComponent(EntityComponentTypes.Inventory)!.container;
  if (equipment != undefined) {
    eq.push(equipment.getEquipment(EquipmentSlot.Head) ?? new ItemStack("minecraft:air"));
    eq.push(equipment.getEquipment(EquipmentSlot.Chest) ?? new ItemStack("minecraft:air"));
    eq.push(equipment.getEquipment(EquipmentSlot.Feet) ?? new ItemStack("minecraft:air"));
    eq.push(equipment.getEquipment(EquipmentSlot.Legs) ?? new ItemStack("minecraft:air"));
    eq.push(equipment.getEquipment(EquipmentSlot.Offhand) ?? new ItemStack("minecraft:air"));

    for (let i = 0; i <= 35; i++) {
      items.push(inventory?.getItem(i) ?? new ItemStack("minecraft:air"));
    }

    let playerData: InvDB = {
      equipment: eq,
      playerName: player.name,
      inv: items,
    };
    playerInvs.push(playerData);
  }
  playerInventories.set("invs", playerInvs);
}

export function dropTheCombatLoggersItems(player: Player) {
  let dimension = player.dimension;
  let location = player.location;
  let name = player.name;
  if (player.hasTag(CRABTAGS.combat)) {
    world.sendMessage(`§b${player.name} Left While in Combat. Their Items 'slipped' Out Of Their Inventory`);
    let playersinv = playerInventories.get("invs")?.filter((inv) => inv.playerName == name);
    system.run(() => {
      playersinv![0].equipment.forEach((equip) => {
        if (equip.typeId != "") {
          dimension.spawnItem(equip, location);
        }
      });
      playersinv![0].inv.forEach((item) => {
        if (item.typeId != "" && item.typeId != "crab:crab_gui" && item.typeId != "crab:crab_staff_gui") {
          dimension.spawnItem(item, location);
        }
      });
    });
  }
}
