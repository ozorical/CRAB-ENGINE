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
        title: "§6Ameteur Bundle",
        description: [
            "§7- §f1x Common Crate Key",
            "§7- §a$50,000 §fIn-game Money",
            "§7- §2Emerald Kit",
            "",
            "§6Price: §e$5 / £3.69"
        ],
        price: "$5 / £3.69"
    },
    {
        title: "§7Moderate Bundle",
        description: [
            "§7- §f3x Common Crate Key",
            "§7- §a$100,000 §fIn-game Money",
            "§7- §6Challenger Kit",
            "",
            "§6Price: §e$8 / £5.99"
        ],
        price: "$8 / £5.99"
    },
    {
        title: "§eAdventurer Bundle",
        description: [
            "§7- §f1x Rare Crate Key",
            "§7- §a$250,000 §fIn-game Money",
            "§7- §5Emperor Kit",
            "",
            "§6Price: §e$10 / £7.39"
        ],
        price: "$10 / £7.39"
    },
    {
        title: "§3Champion Bundle",
        description: [
            "§7- §f3x Rare Crate Key",
            "§7- §a$500,000 §fIn-game Money",
            "§7- §8Netherite Kit",
            "§7- §dDonator §7Perks",
            "",
            "§6Price: §e$12 / £9.59"
        ],
        price: "$12 / £9.59"
    },
    {
        title: "§bTitan Bundle",
        description: [
            "§7- §f1x Mythic Crate Key",
            "§7- §a$750,000 §fIn-game Money",
            "§7- §3Warden Kit",
            "§7- §dDonator §7Perks",
            "§7- §eExclusive Battlepass",
            "",
            "§6Price: §e$15 / £11"
        ],
        price: "$15 / £11"
    },
    {
        title: "§5Overlord Bundle",
        description: [
            "§7- §f3x Mythic Crate Keys",
            "§7- §a$1,000,000 §fIn-game Money",
            "§7- §6Parcanite Kit",
            "§7- §dDonator§f+ §7Perks",
            "§7- §eExclusive Battlepass",
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
            "§9discord.gg/crabsmp\n\n" +
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
            player.sendMessage("§9Visit §b#donation-market §9on our Discord to purchase: §ddiscord.gg/crabsmp");
        }
        donoMarketMenu(player);
    });
}