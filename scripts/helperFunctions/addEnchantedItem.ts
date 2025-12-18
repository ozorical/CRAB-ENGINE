import { ItemStack, Player, ItemComponentTypes, Enchantment, EntityComponentTypes } from "@minecraft/server";

export function addEnchantedItem(player: Player, item: string, enchants: Array<Enchantment>, amount: number) {
  let addItem = new ItemStack(item, amount);
  addItem.getComponent("minecraft:enchantable")?.addEnchantments(enchants);
  player.getComponent("minecraft:inventory")?.container?.addItem(addItem);
}
