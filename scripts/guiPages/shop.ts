"use strict";
import { system, world, Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { advancedRelay } from "../protocol/protocol";

interface ShopItem {
    name: string;
    price: number;
    type: 'item' | 'tag' | 'function';
    value: string | ((player: Player) => void);
    amount?: number;
    texture: string;
    lore?: string;
    category?: string[];
}

export class ShopSystem {
    private static readonly SCOREBOARD = 'money';
    private static readonly SHOP_CHANNEL_ID = "1392518745372496013";
    private static readonly EMBED_COLOR = "00FF00"; // Green color
    
    private static categories: Record<string, {
        name: string;
        icon: string;
        description?: string;
    }> = {
        BLOCKS: {
            name: "Building Blocks",
            icon: "textures/blocks/stone",
            description: "Essential blocks for construction"
        },
        TOOLS: {
            name: "Tools & Weapons",
            icon: "textures/items/diamond_pickaxe",
            description: "Gear to help you mine and fight"
        },
        ARMOR: {
            name: "Armor & Gear",
            icon: "textures/items/diamond_chestplate",
            description: "Protection for your adventures"
        },
        SPECIAL: {
            name: "Special Items",
            icon: "textures/ui/icon_best3",
            description: "Rare and unique items"
        },
        UTILITY: {
            name: "Utilities",
            icon: "textures/items/compass_item",
            description: "Useful items for survival"
        },
        FOOD: {
            name: "Food & Farming",
            icon: "textures/items/apple_golden",
            description: "Nourishment for your journey"
        },
        MAGIC: {
            name: "Magic & Potions",
            icon: "textures/items/potion_bottle_splash_heal",
            description: "Potions and enchantments"
        },
        TRANSPORT: {
            name: "Transportation",
            icon: "textures/items/saddle",
            description: "Vehicles and movement aids"
        },
        DECORATION: {
            name: "Decoration",
            icon: "textures/blocks/flower_tulip_red",
            description: "Aesthetic blocks and items"
        }
    };

  private static allItems: ShopItem[] = [
    { name: "64 Stone", price: 300, type: 'item', value: 'minecraft:stone', amount: 64, texture: "textures/blocks/stone", category: ['BLOCKS'] },
    { name: "64 Cobblestone", price: 240, type: 'item', value: 'minecraft:cobblestone', amount: 64, texture: "textures/blocks/cobblestone", category: ['BLOCKS'] },
    { name: "64 Oak Logs", price: 450, type: 'item', value: 'minecraft:log', amount: 64, texture: "textures/blocks/log_oak", category: ['BLOCKS'] },
    { name: "64 Spruce Logs", price: 480, type: 'item', value: 'minecraft:log 1', amount: 64, texture: "textures/blocks/log_spruce", category: ['BLOCKS'] },
    { name: "64 Birch Logs", price: 510, type: 'item', value: 'minecraft:log 2', amount: 64, texture: "textures/blocks/log_birch", category: ['BLOCKS'] },
    { name: "64 Jungle Logs", price: 540, type: 'item', value: 'minecraft:log 3', amount: 64, texture: "textures/blocks/log_jungle", category: ['BLOCKS'] },
    { name: "64 Stone Bricks", price: 750, type: 'item', value: 'minecraft:stonebrick', amount: 64, texture: "textures/blocks/stonebrick", category: ['BLOCKS'] },
    { name: "64 Sandstone", price: 660, type: 'item', value: 'minecraft:sandstone', amount: 64, texture: "textures/blocks/sandstone_normal", category: ['BLOCKS'] },
    { name: "64 Bricks", price: 900, type: 'item', value: 'minecraft:brick_block', amount: 64, texture: "textures/blocks/brick", category: ['BLOCKS'] },
    { name: "64 Nether Bricks", price: 1200, type: 'item', value: 'minecraft:nether_brick', amount: 64, texture: "textures/blocks/nether_brick", category: ['BLOCKS'] },
    { name: "64 Quartz Block", price: 1500, type: 'item', value: 'minecraft:quartz_block', amount: 64, texture: "textures/blocks/quartz_block_side", category: ['BLOCKS'] },
    { name: "64 Oak Planks", price: 360, type: 'item', value: 'minecraft:planks', amount: 64, texture: "textures/blocks/planks_oak", category: ['BLOCKS'] },
    { name: "64 Glass", price: 540, type: 'item', value: 'minecraft:glass', amount: 64, texture: "textures/blocks/glass", category: ['BLOCKS'] },
    { name: "64 Wool", price: 480, type: 'item', value: 'minecraft:wool', amount: 64, texture: "textures/blocks/wool_colored_white", category: ['BLOCKS'] },
    { name: "64 Iron Blocks", price: 6000, type: 'item', value: 'minecraft:iron_block', amount: 64, texture: "textures/blocks/iron_block", category: ['BLOCKS'] },
    { name: "64 Gold Blocks", price: 12000, type: 'item', value: 'minecraft:gold_block', amount: 64, texture: "textures/blocks/gold_block", category: ['BLOCKS'] },
    { name: "64 Diamond Blocks", price: 60000, type: 'item', value: 'minecraft:diamond_block', amount: 64, texture: "textures/blocks/diamond_block", category: ['BLOCKS'] },
    { name: "64 Smooth Stone", price: 420, type: 'item', value: 'minecraft:smooth_stone', amount: 64, texture: "textures/blocks/smoothstone", category: ['BLOCKS'] },
    { name: "64 Polished Granite", price: 480, type: 'item', value: 'minecraft:stone 2', amount: 64, texture: "textures/blocks/stone_granite_smooth", category: ['BLOCKS'] },
    { name: "64 Obsidian", price: 4500, type: 'item', value: 'minecraft:obsidian', amount: 64, texture: "textures/blocks/obsidian", category: ['BLOCKS'] },

    { name: "Wooden Tool Set", price: 600, type: 'function', value: (player) => {
        player.runCommand('give @s wooden_pickaxe 1');
        player.runCommand('give @s wooden_axe 1');
        player.runCommand('give @s wooden_shovel 1');
        player.runCommand('give @s wooden_sword 1');
    }, texture: "textures/items/wood_pickaxe", category: ['TOOLS'] },
    { name: "Stone Tool Set", price: 1200, type: 'function', value: (player) => {
        player.runCommand('give @s stone_pickaxe 1');
        player.runCommand('give @s stone_axe 1');
        player.runCommand('give @s stone_shovel 1');
        player.runCommand('give @s stone_sword 1');
    }, texture: "textures/items/stone_pickaxe", category: ['TOOLS'] },
    { name: "Iron Tool Set", price: 3000, type: 'function', value: (player) => {
        player.runCommand('give @s iron_pickaxe 1');
        player.runCommand('give @s iron_axe 1');
        player.runCommand('give @s iron_shovel 1');
        player.runCommand('give @s iron_sword 1');
    }, texture: "textures/items/iron_pickaxe", category: ['TOOLS'] },
    { name: "Diamond Tool Set", price: 15000, type: 'function', value: (player) => {
        player.runCommand('give @s diamond_pickaxe 1');
        player.runCommand('give @s diamond_axe 1');
        player.runCommand('give @s diamond_shovel 1');
        player.runCommand('give @s diamond_sword 1');
    }, texture: "textures/items/diamond_pickaxe", category: ['TOOLS'] },
    { name: "Netherite Tool Set", price: 45000, type: 'function', value: (player) => {
        player.runCommand('give @s netherite_pickaxe 1');
        player.runCommand('give @s netherite_axe 1');
        player.runCommand('give @s netherite_shovel 1');
        player.runCommand('give @s netherite_sword 1');
    }, texture: "textures/items/netherite_pickaxe", category: ['TOOLS'] },
    { name: "Bow", price: 1500, type: 'item', value: 'minecraft:bow', texture: "textures/items/bow_standby", category: ['TOOLS'] },
    { name: "Crossbow", price: 1800, type: 'item', value: 'minecraft:crossbow', texture: "textures/items/crossbow_standby", category: ['TOOLS'] },
    { name: "Trident", price: 6000, type: 'item', value: 'minecraft:trident', texture: "textures/items/trident", category: ['TOOLS'] },
    { name: "Enchanted Bow", price: 4500, type: 'item', value: 'minecraft:bow', texture: "textures/items/bow_standby", category: ['TOOLS'] },
    { name: "64 Arrows", price: 600, type: 'item', value: 'minecraft:arrow', amount: 64, texture: "textures/items/arrow", category: ['TOOLS'] },
    { name: "Flint and Steel", price: 600, type: 'item', value: 'minecraft:flint_and_steel', texture: "textures/items/flint_and_steel", category: ['TOOLS'] },
    { name: "Shears", price: 450, type: 'item', value: 'minecraft:shears', texture: "textures/items/shears", category: ['TOOLS'] },
    { name: "Hoe Set", price: 900, type: 'function', value: (player) => {
        player.runCommand('give @s wooden_hoe 1');
        player.runCommand('give @s stone_hoe 1');
        player.runCommand('give @s iron_hoe 1');
    }, texture: "textures/items/iron_hoe", category: ['TOOLS'] },

    { name: "Leather Armor Set", price: 1500, type: 'function', value: (player) => {
        player.runCommand('give @s leather_helmet 1');
        player.runCommand('give @s leather_chestplate 1');
        player.runCommand('give @s leather_leggings 1');
        player.runCommand('give @s leather_boots 1');
    }, texture: "textures/items/leather_chestplate", category: ['ARMOR'] },
    { name: "Iron Armor Set", price: 9000, type: 'function', value: (player) => {
        player.runCommand('give @s iron_helmet 1');
        player.runCommand('give @s iron_chestplate 1');
        player.runCommand('give @s iron_leggings 1');
        player.runCommand('give @s iron_boots 1');
    }, texture: "textures/items/iron_chestplate", category: ['ARMOR'] },
    { name: "Diamond Armor Set", price: 45000, type: 'function', value: (player) => {
        player.runCommand('give @s diamond_helmet 1');
        player.runCommand('give @s diamond_chestplate 1');
        player.runCommand('give @s diamond_leggings 1');
        player.runCommand('give @s diamond_boots 1');
    }, texture: "textures/items/diamond_chestplate", category: ['ARMOR'] },
    { name: "Netherite Armor Set", price: 90000, type: 'function', value: (player) => {
        player.runCommand('give @s netherite_helmet 1');
        player.runCommand('give @s netherite_chestplate 1');
        player.runCommand('give @s netherite_leggings 1');
        player.runCommand('give @s netherite_boots 1');
    }, texture: "textures/items/netherite_chestplate", category: ['ARMOR'] },
    { name: "Turtle Helmet", price: 6000, type: 'item', value: 'minecraft:turtle_helmet', texture: "textures/items/turtle_helmet", category: ['ARMOR'] },
    { name: "Elytra", price: 60000, type: 'item', value: 'minecraft:elytra', texture: "textures/items/elytra", category: ['ARMOR', 'SPECIAL'] },
    { name: "Colored Leather Helmet", price: 750, type: 'item', value: 'minecraft:leather_helmet', texture: "textures/items/leather_helmet", category: ['ARMOR'] },

    { name: "Dragon Egg", price: 300000, type: 'item', value: 'minecraft:dragon_egg', texture: "textures/blocks/dragon_egg", category: ['SPECIAL'] },
    { name: "Nether Star", price: 150000, type: 'item', value: 'minecraft:nether_star', texture: "textures/items/nether_star", category: ['SPECIAL'] },
    { name: "Totem of Undying", price: 30000, type: 'item', value: 'minecraft:totem', texture: "textures/items/totem", category: ['SPECIAL'] },
    { name: "End Crystal", price: 15000, type: 'item', value: 'minecraft:end_crystal', texture: "textures/items/end_crystal", category: ['SPECIAL'] },
    { name: "Beacon", price: 75000, type: 'item', value: 'minecraft:beacon', texture: "textures/blocks/beacon", category: ['SPECIAL'] },
    { name: "Enchanted Golden Apple", price: 36000, type: 'item', value: 'minecraft:enchanted_golden_apple', texture: "textures/items/apple_golden", category: ['SPECIAL'] },
    { name: "Music Disc Collection", price: 24000, type: 'function', value: (player) => {
        player.runCommand('give @s record_13 1');
        player.runCommand('give @s record_cat 1');
        player.runCommand('give @s record_blocks 1');
        player.runCommand('give @s record_chirp 1');
        player.runCommand('give @s record_far 1');
    }, texture: "textures/items/record_13", category: ['SPECIAL'] },

    { name: "Compass", price: 900, type: 'item', value: 'minecraft:compass', texture: "textures/items/compass_item", category: ['UTILITY'] },
    { name: "Clock", price: 900, type: 'item', value: 'minecraft:clock', texture: "textures/items/clock_item", category: ['UTILITY'] },
    { name: "Map", price: 600, type: 'item', value: 'minecraft:map', texture: "textures/items/map_empty", category: ['UTILITY'] },
    { name: "Water Bucket", price: 600, type: 'item', value: 'minecraft:water_bucket', texture: "textures/items/bucket_water", category: ['UTILITY'] },
    { name: "Lava Bucket", price: 900, type: 'item', value: 'minecraft:lava_bucket', texture: "textures/items/bucket_lava", category: ['UTILITY'] },
    { name: "Fishing Rod", price: 900, type: 'item', value: 'minecraft:fishing_rod', texture: "textures/items/fishing_rod_uncast", category: ['UTILITY'] },
    { name: "Name Tag", price: 1500, type: 'item', value: 'minecraft:name_tag', texture: "textures/items/name_tag", category: ['UTILITY'] },
    { name: "Lead", price: 750, type: 'item', value: 'minecraft:lead', texture: "textures/items/lead", category: ['UTILITY'] },
    { name: "Ender Pearl", price: 1200, type: 'item', value: 'minecraft:ender_pearl', texture: "textures/items/ender_pearl", category: ['UTILITY'] },
    { name: "Eye of Ender", price: 1800, type: 'item', value: 'minecraft:ender_eye', texture: "textures/items/ender_eye", category: ['UTILITY'] },
    { name: "64 Torches", price: 450, type: 'item', value: 'minecraft:torch', amount: 64, texture: "textures/blocks/torch_on", category: ['UTILITY'] },
    { name: "16 Redstone", price: 600, type: 'item', value: 'minecraft:redstone', amount: 16, texture: "textures/items/redstone_dust", category: ['UTILITY'] },
    { name: "TNT", price: 1500, type: 'item', value: 'minecraft:tnt', texture: "textures/blocks/tnt_side", category: ['UTILITY'] },
    { name: "Spyglass", price: 2400, type: 'item', value: 'minecraft:spyglass', texture: "textures/items/spyglass", category: ['UTILITY'] },
    { name: "Recovery Compass", price: 3000, type: 'item', value: 'minecraft:recovery_compass', texture: "textures/items/recovery_compass_item", category: ['UTILITY'] },

    { name: "64 Bread", price: 600, type: 'item', value: 'minecraft:bread', amount: 64, texture: "textures/items/bread", category: ['FOOD'] },
    { name: "64 Cooked Beef", price: 1200, type: 'item', value: 'minecraft:cooked_beef', amount: 64, texture: "textures/items/beef_cooked", category: ['FOOD'] },
    { name: "64 Golden Carrots", price: 2400, type: 'item', value: 'minecraft:golden_carrot', amount: 64, texture: "textures/items/carrot_golden", category: ['FOOD'] },
    { name: "Golden Apple", price: 3000, type: 'item', value: 'minecraft:golden_apple', texture: "textures/items/apple_golden", category: ['FOOD'] },
    { name: "64 Apples", price: 450, type: 'item', value: 'minecraft:apple', amount: 64, texture: "textures/items/apple", category: ['FOOD'] },
    { name: "64 Cooked Chicken", price: 900, type: 'item', value: 'minecraft:cooked_chicken', amount: 64, texture: "textures/items/chicken_cooked", category: ['FOOD'] },
    { name: "64 Cookies", price: 300, type: 'item', value: 'minecraft:cookie', amount: 64, texture: "textures/items/cookie", category: ['FOOD'] },
    { name: "64 Seeds", price: 150, type: 'item', value: 'minecraft:wheat_seeds', amount: 64, texture: "textures/items/seeds_wheat", category: ['FOOD'] },
    { name: "64 Carrots", price: 180, type: 'item', value: 'minecraft:carrot', amount: 64, texture: "textures/items/carrot", category: ['FOOD'] },
    { name: "64 Potatoes", price: 180, type: 'item', value: 'minecraft:potato', amount: 64, texture: "textures/items/potato", category: ['FOOD'] },
    { name: "Cake", price: 1500, type: 'item', value: 'minecraft:cake', texture: "textures/blocks/cake_side", category: ['FOOD'] },
    { name: "64 Sweet Berries", price: 360, type: 'item', value: 'minecraft:sweet_berries', amount: 64, texture: "textures/items/sweet_berries", category: ['FOOD'] },

    { name: "Healing Potion", price: 1500, type: 'item', value: 'minecraft:potion 5', texture: "textures/items/potion_bottle_heal", category: ['MAGIC'] },
    { name: "Speed Potion", price: 1200, type: 'item', value: 'minecraft:potion 1', texture: "textures/items/potion_bottle_moveSpeed", category: ['MAGIC'] },
    { name: "Strength Potion", price: 1800, type: 'item', value: 'minecraft:potion 9', texture: "textures/items/potion_bottle_damageBoost", category: ['MAGIC'] },
    { name: "Night Vision Potion", price: 1350, type: 'item', value: 'minecraft:potion 6', texture: "textures/items/potion_bottle_nightVision", category: ['MAGIC'] },
    { name: "Fire Resistance", price: 2100, type: 'item', value: 'minecraft:potion 3', texture: "textures/items/potion_bottle_fireResistance", category: ['MAGIC'] },
    { name: "Water Breathing", price: 1650, type: 'item', value: 'minecraft:potion 19', texture: "textures/items/potion_bottle_waterBreathing", category: ['MAGIC'] },
    { name: "Invisibility Potion", price: 2400, type: 'item', value: 'minecraft:potion 7', texture: "textures/items/potion_bottle_invisibility", category: ['MAGIC'] },
    { name: "Jump Boost Potion", price: 1050, type: 'item', value: 'minecraft:potion 2', texture: "textures/items/potion_bottle_jump", category: ['MAGIC'] },
    { name: "Enchanted Book", price: 6000, type: 'item', value: 'minecraft:enchanted_book', texture: "textures/items/book_enchanted", category: ['MAGIC'] },
    { name: "Blaze Powder", price: 900, type: 'item', value: 'minecraft:blaze_powder', texture: "textures/items/blaze_powder", category: ['MAGIC'] },
    { name: "Ender Eye", price: 1800, type: 'item', value: 'minecraft:ender_eye', texture: "textures/items/ender_eye", category: ['MAGIC'] },
    { name: "Experience Bottle", price: 750, type: 'item', value: 'minecraft:experience_bottle', texture: "textures/items/experience_bottle", category: ['MAGIC'] },

    { name: "Saddle", price: 1800, type: 'item', value: 'minecraft:saddle', texture: "textures/items/saddle", category: ['TRANSPORT'] },
    { name: "Boat", price: 600, type: 'item', value: 'minecraft:boat', texture: "textures/items/boat", category: ['TRANSPORT'] },
    { name: "Minecart", price: 900, type: 'item', value: 'minecraft:minecart', texture: "textures/items/minecart_normal", category: ['TRANSPORT'] },
    { name: "Powered Rail", price: 300, type: 'item', value: 'minecraft:golden_rail', texture: "textures/blocks/rail_golden", category: ['TRANSPORT'] },
    { name: "64 Rails", price: 1200, type: 'item', value: 'minecraft:rail', amount: 64, texture: "textures/blocks/rail_normal", category: ['TRANSPORT'] },
    { name: "Chest Minecart", price: 1500, type: 'item', value: 'minecraft:chest_minecart', texture: "textures/items/minecart_chest", category: ['TRANSPORT'] },
    { name: "Furnace Minecart", price: 1350, type: 'item', value: 'minecraft:furnace_minecart', texture: "textures/items/minecart_furnace", category: ['TRANSPORT'] },
    { name: "Carrot on Stick", price: 1050, type: 'item', value: 'minecraft:carrot_on_a_stick', texture: "textures/items/carrot_on_a_stick", category: ['TRANSPORT'] },
    { name: "Ice", price: 450, type: 'item', value: 'minecraft:ice', texture: "textures/blocks/ice", category: ['TRANSPORT'] },
    { name: "Packed Ice", price: 600, type: 'item', value: 'minecraft:packed_ice', texture: "textures/blocks/ice_packed", category: ['TRANSPORT'] },

    { name: "64 Flowers", price: 600, type: 'item', value: 'minecraft:red_flower', amount: 64, texture: "textures/blocks/flower_rose", category: ['DECORATION'] },
    { name: "64 Colored Wool", price: 900, type: 'item', value: 'minecraft:wool 1', amount: 64, texture: "textures/blocks/wool_colored_orange", category: ['DECORATION'] },
    { name: "Item Frame", price: 450, type: 'item', value: 'minecraft:frame', texture: "textures/items/item_frame", category: ['DECORATION'] },
    { name: "Painting", price: 300, type: 'item', value: 'minecraft:painting', texture: "textures/items/painting", category: ['DECORATION'] },
    { name: "64 Carpet", price: 600, type: 'item', value: 'minecraft:carpet', amount: 64, texture: "textures/blocks/wool_colored_white", category: ['DECORATION'] },
    { name: "Flower Pot", price: 240, type: 'item', value: 'minecraft:flower_pot', texture: "textures/items/flower_pot", category: ['DECORATION'] },
    { name: "Sea Lantern", price: 1500, type: 'item', value: 'minecraft:sea_lantern', texture: "textures/blocks/sea_lantern", category: ['DECORATION'] },
    { name: "Glowstone", price: 900, type: 'item', value: 'minecraft:glowstone', texture: "textures/blocks/glowstone", category: ['DECORATION'] },
    { name: "Jack o Lantern", price: 750, type: 'item', value: 'minecraft:lit_pumpkin', texture: "textures/blocks/pumpkin_face_on", category: ['DECORATION'] },
    { name: "Armor Stand", price: 1050, type: 'item', value: 'minecraft:armor_stand', texture: "textures/items/armor_stand", category: ['DECORATION'] }
];

    private static formatCurrency(amount: number): string {
        if (amount >= 1000000) return `$${(amount/1000000).toFixed(1)}M`;
        if (amount >= 1000) return `$${(amount/1000).toFixed(1)}K`;
        return `$${amount}`;
    }

    private static getPlayerMoney(player: Player): number {
        try {
            const scoreboard = world.scoreboard.getObjective(ShopSystem.SCOREBOARD);
            if (!scoreboard) return 0;
            return scoreboard.getScore(player.scoreboardIdentity ?? player) ?? 0;
        } catch {
            return 0;
        }
    }

    private static setPlayerMoney(player: Player, amount: number): void {
        const scoreboard = world.scoreboard.getObjective(ShopSystem.SCOREBOARD) ?? 
                          world.scoreboard.addObjective(ShopSystem.SCOREBOARD, ShopSystem.SCOREBOARD);
        scoreboard.setScore(player.scoreboardIdentity ?? player, amount);
    }

    public static async showMainMenu(player: Player): Promise<void> {
        const form = new ActionFormData()
            .title("§6Main Shop Menu")
            .body(`§aBalance: §e${ShopSystem.formatCurrency(ShopSystem.getPlayerMoney(player))}\n§7Select a category to browse items:`);

        for (const [key, category] of Object.entries(ShopSystem.categories)) {
            form.button(`§f${category.name}`, category.icon);
        }

        form.button("§cExit Shop", "textures/ui/redX1");

        const response = await form.show(player as any);
        if (response.canceled) return;

        if (typeof response.selection === "number" && response.selection < Object.keys(ShopSystem.categories).length) {
            const categoryKey = Object.keys(ShopSystem.categories)[response.selection];
            await ShopSystem.showCategoryMenu(player, categoryKey);
        }
    }

    private static async showCategoryMenu(player: Player, categoryKey: string): Promise<void> {
        const category = ShopSystem.categories[categoryKey];
        if (!category) return;

        const categoryItems = ShopSystem.allItems.filter(item => 
            item.category?.includes(categoryKey)
        );

        const form = new ActionFormData()
            .title(`§6${category.name} Shop`)
            .body(`§aBalance: §e${ShopSystem.formatCurrency(ShopSystem.getPlayerMoney(player))}\n§7${category.description}`);

        categoryItems.forEach(item => {
            form.button(`§b${item.name}\n§e${ShopSystem.formatCurrency(item.price)}`, item.texture);
        });

        form.button("§aBack to Main Menu", "textures/ui/refresh");

        const response = await form.show(player as any);
        if (response.canceled) return;

        if (typeof response.selection === "number" && response.selection < categoryItems.length) {
            await ShopSystem.showPurchaseConfirmation(player, categoryItems[response.selection], categoryKey);
        } else if (response.selection === categoryItems.length) {
            await ShopSystem.showMainMenu(player);
        } else if (response.selection === categoryItems.length + 1) {
            await ShopSystem.showCategoryMenu(player, categoryKey);
        }
    }

    private static async showPurchaseConfirmation(player: Player, item: ShopItem, returnCategory: string): Promise<void> {
        const form = new ActionFormData()
            .title(`§6Purchase ${item.name}`)
            .body(
                `§aItem: §f${item.name}\n` +
                `§aPrice: §e${ShopSystem.formatCurrency(item.price)}\n` +
                (item.lore ? `§aDescription: §7${item.lore}\n\n` : '\n') +
                `§fYour balance: §e${ShopSystem.formatCurrency(ShopSystem.getPlayerMoney(player))}\n\n` +
                `§7Are you sure you want to purchase this item?`
            )
            .button("§aConfirm Purchase")
            .button("§cCancel");

        const response = await form.show(player as any);
        if (response.canceled || response.selection === 1) {
            await ShopSystem.showCategoryMenu(player, returnCategory);
            return;
        }

        const money = ShopSystem.getPlayerMoney(player);
        if (money < item.price) {
            const errorForm = new ActionFormData()
                .title("§cInsufficient Funds")
                .body(`§cYou don't have enough money!\n\nYou need: §e${ShopSystem.formatCurrency(item.price)}\nYou have: §e${ShopSystem.formatCurrency(money)}\n\n§cYou need ${ShopSystem.formatCurrency(item.price - money)} more.`)
                .button("§aBack to Shop");

            await errorForm.show(player as any);
            await ShopSystem.showCategoryMenu(player, returnCategory);
            return;
        }

        ShopSystem.setPlayerMoney(player, money - item.price);
        
        try {
            if (typeof item.value === 'function') {
                item.value(player);
            } else {
                switch (item.type) {
                    case 'item':
                        player.runCommand(`give @s ${item.value} ${item.amount ?? 1}`);
                        break;
                    case 'tag':
                        player.addTag(item.value);
                        break;
                }
            }


            const descriptiont = `${player.name} purchased ${item.name} for ${ShopSystem.formatCurrency(item.price)}`;

            const channelID = "1392518745372496013"
            const description = `${descriptiont}`
            const title = "Shop Purchase"
            const color = ShopSystem.EMBED_COLOR
            const thumbnail = "https://img.freepik.com/premium-vector/pichel-art-shopping-icon-retro-vector-8bit-hame-style-computer_740246-357.jpg"
            
            advancedRelay(channelID, description, title, color, thumbnail);

            const successForm = new ActionFormData()
                .title("§aPurchase Successful!")
                .body(`§aYou purchased §6${item.name} §afor §e${ShopSystem.formatCurrency(item.price)}§a!\n\n§fNew balance: §e${ShopSystem.formatCurrency(money - item.price)}`)
                .button("§aContinue Shopping");

            await successForm.show(player as any);
            player.playSound("random.orb");
            await ShopSystem.showCategoryMenu(player, returnCategory);
        } catch (error) {
            console.error("Purchase error:", error);
            ShopSystem.setPlayerMoney(player, money);
            
            const errorForm = new ActionFormData()
                .title("§cPurchase Error")
                .body("§cAn error occurred during your purchase.\n\nPlease contact an administrator.")
                .button("§aBack to Shop");

            await errorForm.show(player as any);
            await ShopSystem.showCategoryMenu(player, returnCategory);
        }
    }

    public static async openShop(player: Player): Promise<void> {
        await this.showMainMenu(player);
    }
}
