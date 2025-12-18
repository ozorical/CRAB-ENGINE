// donoMarket.ts
import { Player } from "@minecraft/server";
import { ActionFormData, FormCancelationReason } from "@minecraft/server-ui";
import { playSoundTo } from "../helperFunctions/sounds";

interface DonoBundle {
    title: string;
    description: string[];
    price: string;
}

const DONO_BUNDLES: DonoBundle[] = [
    {
        title: "§6Builder Bundle",
        description: [
            "§7- §f1x Common Crate Key",
            "§7- §f64x Diamond Blocks",
            "§7- §f64x Emerald Blocks",
            "§7- §f64x Gold Blocks",
            "§7- §f64x Netherite Blocks",
            "§7- §f64x Beacon",
            "",
            "§6Perfect for creative construction projects",
            "",
            "§6Price: §e$5 / £3.69"
        ],
        price: "$5 / £3.69"
    },
    {
        title: "§7Adventurer Bundle",
        description: [
            "§7- §f3x Common Crate Key",
            "§7- §fFull Netherite Armor Set",
            "§7- §fNetherite Tool Set",
            "§7- §fElytra",
            "§7- §fShulker Box",
            "§7- §fTotem of Undying x5",
            "",
            "§6Everything you need for exploration",
            "",
            "§6Price: §e$8 / £5.99"
        ],
        price: "$8 / £5.99"
    },
    {
        title: "§eEnchanter Bundle",
        description: [
            "§7- §f1x Rare Crate Key",
            "§7- §f64x Enchanted Golden Apples",
            "§7- §f64x Experience Bottles",
            "§7- §f64x Lapis Lazuli",
            "§7- §f64x Bookshelves",
            "§7- §f64x Anvils",
            "",
            "§6For the ultimate enchanting setup",
            "",
            "§6Price: §e$10 / £7.39"
        ],
        price: "$10 / £7.39"
    },
    {
        title: "§3Redstone Engineer Bundle",
        description: [
            "§7- §f3x Rare Crate Key",
            "§7- §f64x Redstone Blocks",
            "§7- §f64x Observers",
            "§7- §f64x Pistons",
            "§7- §f64x Hoppers",
            "§7- §f64x Dispensers",
            "§7- §f64x Target Blocks",
            "",
            "§6All components for complex contraptions",
            "",
            "§6Price: §e$12 / £9.59"
        ],
        price: "$12 / £9.59"
    },
    {
        title: "§bFarmers Bundle",
        description: [
            "§7- §f1x Mythic Crate Key",
            "§7- §f64x Bone Meal",
            "§7- §f64x Golden Carrots",
            "§7- §f64x Honey Blocks",
            "§7- §f64x Beehives",
            "§7- §f64x Composters",
            "§7- §f64x Water Buckets",
            "",
            "§6Optimize your farming operations",
            "",
            "§6Price: §e$15 / £11"
        ],
        price: "$15 / £11"
    },
    {
        title: "§5Ultimate Bundle",
        description: [
            "§7- §f3x Mythic Crate Keys",
            "§7- §fAll previous bundle contents",
            "§7- §f64x Beacon",
            "§7- §f64x Conduit",
            "§7- §f64x Dragon Egg",
            "§7- §f64x Spawn Eggs (all types)",
            "§7- §fExclusive §dDonator §7Tag",
            "§7- §fPriority Support",
            "",
            "§6The complete Minecraft experience",
            "",
            "§6Price: §e$20 / £14.99"
        ],
        price: "$20 / £14.99"
    }
];

export function donoMarketMenu(player: Player) {
    const form = new ActionFormData()
        .title("§dDonation §fMarket")
        .body(
            "§6PLEASE NOTE: §7All purchases must be made through our Discord server!\n" +
            "§9discord.gg/nexussmp\n\n" +
            "§7Visit §b#donation-market §7to purchase these bundles!"
        );

    for (const bundle of DONO_BUNDLES) {
        form.button(`${bundle.title}\n§8[ §f${bundle.price} §8]`);
    }

    form.button("§4Back§r\n§8[ §fReturn to menu §8]", "textures/blocks/barrier");

    interface DonoMarketMenuResponse {
        canceled: boolean;
        cancelationReason?: FormCancelationReason;
        selection?: number;
    }

    form.show(player as any).then((response: DonoMarketMenuResponse) => {
        if (response.canceled) {
            if (response.cancelationReason === FormCancelationReason.UserBusy) {
                donoMarketMenu(player);
            }
            return;
        }

        playSoundTo(player, "RandomPop");

        const selection: number | undefined = response.selection;
        if (selection === DONO_BUNDLES.length) {
            return;
        }

        if (typeof selection === "number" && selection >= 0 && selection < DONO_BUNDLES.length) {
            showBundleDetails(player, DONO_BUNDLES[selection]);
        }
    });
}

function showBundleDetails(player: Player, bundle: DonoBundle) {
    const form = new ActionFormData()
        .title(bundle.title)
        .body(bundle.description.join("\n"))
        .button("§l§2Purchase Info§r\n§8[ §fDiscord Link §8]", "textures/items/book_portfolio")
        .button("§l§4Back§r\n§8[ §fReturn to bundles §8]", "textures/blocks/barrier");

    form.show(player as any).then((response: {
        canceled: boolean;
        cancelationReason?: FormCancelationReason;
        selection?: number;
    }) => {
        if (response.canceled) {
            if (response.cancelationReason === FormCancelationReason.UserBusy) {
                showBundleDetails(player, bundle);
            }
            return;
        }

        playSoundTo(player, "RandomPop");

        if (response.selection === 0) {
            player.sendMessage("§9Visit §b#donation-market §9on our Discord to purchase: §ddiscord.gg/nexussmp");
        }
        donoMarketMenu(player);
    });
}