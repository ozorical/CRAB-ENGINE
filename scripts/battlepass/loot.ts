import { loot } from "../types";

const Loot: Array<string | loot> = [
  // Weapons
  "minecraft:diamond_sword",
  "minecraft:netherite_sword",
  "minecraft:trident",

  // Armor
  "minecraft:diamond_helmet",
  "minecraft:diamond_chestplate",
  "minecraft:diamond_leggings",
  "minecraft:diamond_boots",
  "minecraft:netherite_helmet",
  "minecraft:netherite_chestplate",
  "minecraft:netherite_leggings",
  "minecraft:netherite_boots",

  // Resources
  "minecraft:diamond",
  "minecraft:emerald",
  "minecraft:netherite_ingot",
  "minecraft:golden_apple",
  "minecraft:enchanted_golden_apple",
  "minecraft:totem_of_undying",

  // Enchanted Books
  { type: "minecraft:sharpness", lvl: 5 },
  { type: "minecraft:smite", lvl: 5 },
  { type: "minecraft:unbreaking", lvl: 3 },
  { type: "minecraft:fortune", lvl: 3 },
  { type: "minecraft:silk_touch", lvl: 1 },
  { type: "minecraft:power", lvl: 5 },
  { type: "minecraft:infinity", lvl: 1 },
  { type: "minecraft:looting", lvl: 3 },
  { type: "minecraft:efficiency", lvl: 5 },
  { type: "minecraft:mending", lvl: 1 },
  // Tools
  "minecraft:diamond_pickaxe",
  "minecraft:netherite_pickaxe",
  "minecraft:elytra",

  // Special Items
  "minecraft:beacon",
  "minecraft:nether_star",
  "minecraft:heart_of_the_sea",
  "minecraft:enchanted_book",
  "minecraft:netherite_block",
  "minecraft:end_crystal",
];

export { Loot };
