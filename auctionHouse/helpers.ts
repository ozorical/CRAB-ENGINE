import { ItemStack } from "@minecraft/server";

export function formatItemId(itemId: string): string {
  return itemId
    .replace("minecraft:", "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getEnchantments(item: ItemStack): { id: string; level: number }[] {
  const enchantments: { id: string; level: number }[] = [];
  const enchantable = item.getComponent("enchantable");
  if (enchantable) {
    const enchants = enchantable.getEnchantments();
    if (enchants) {
      for (const enchant of enchants) {
        enchantments.push({ id: enchant.type.id, level: enchant.level });
      }
    }
  }
  return enchantments;
}
