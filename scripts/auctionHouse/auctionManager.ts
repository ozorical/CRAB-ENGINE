import { system, world, Player } from "@minecraft/server";
import { AuctionItem } from "./interfaces";
import { giveItem } from "../helperFunctions/inventory";
import { addScore } from "../helperFunctions/getScore";
import { formatItemId } from "./helpers";
import { playSoundTo } from "../helperFunctions/sounds";
import { advancedRelay, relay } from "../protocol/protocol";

let auctions: AuctionItem[] = []; // te

export function checkExpiredAuctions() {
    const now = system.currentTick;
    for (let i = auctions.length - 1; i >= 0; i--) {
        const auction = auctions[i];

        if (now >= auction.expiresAt) {
            try {
                const seller = findValidPlayer(auction.seller);
                if (seller) {
                    giveItem(seller, auction.itemId, auction.amount, auction.customName ?? "");
                    seller.sendMessage(`§cYour auction for ${formatItemId(auction.itemId)} has expired.`);
                    advancedRelay("1397332742781272094", `Auction for ${formatItemId(auction.itemId)} by ${seller.name} has expired.`, "Auction Expired", "FF0000");
                    playSoundTo(seller, "Success");
                } else {
                    storeOfflineItem(typeof auction.seller === 'string' ? auction.seller : auction.seller.name, auction.itemId, auction.amount, auction.customName);
                }

                if (auction.highestBidder) {
                    const bidder = findValidPlayer(auction.highestBidder);
                    if (bidder) {
                        addScore(bidder, "money", auction.currentBid);
                    } else {
                        addOfflineScore(typeof auction.highestBidder === 'string' ? auction.highestBidder : auction.highestBidder.name, "money", auction.currentBid);
                    }
                }

                auctions.splice(i, 1);
            } catch (error) {
                console.error(`Error processing expired auction: ${error}`);
            }
        }
    }
}

function findValidPlayer(playerIdentifier: string | Player): Player | null {
    if (typeof playerIdentifier !== 'string') {
        return playerIdentifier.isValid ? playerIdentifier : null;
    }

    const player = world.getPlayers().find(p => 
        p.name === playerIdentifier || p.id === playerIdentifier
    );
    return player?.isValid ? player : null;
}

function storeOfflineItem(playerName: string, itemId: string, amount: number, customName?: string) {
    const offlineItems = JSON.parse((world.getDynamicProperty("offlineItems") as string) || "{}");
    if (!offlineItems[playerName]) offlineItems[playerName] = [];
    
    offlineItems[playerName].push({
        itemId,
        amount,
        customName,
        timestamp: system.currentTick
    });
    
    world.setDynamicProperty("offlineItems", JSON.stringify(offlineItems));
}

function addOfflineScore(playerName: string, objective: string, value: number) {
    const offlineScores = JSON.parse((world.getDynamicProperty("offlineScores") as string) || "{}");
    if (!offlineScores[playerName]) offlineScores[playerName] = {};
    if (!offlineScores[playerName][objective]) offlineScores[playerName][objective] = 0;
    
    offlineScores[playerName][objective] += value;
    world.setDynamicProperty("offlineScores", JSON.stringify(offlineScores));
}

export function deliverOfflineItems(player: Player) {
    const offlineItems = JSON.parse((world.getDynamicProperty("offlineItems") as string) || "{}");
    if (offlineItems[player.name]) {
        for (const item of offlineItems[player.name]) {
            giveItem(player, item.itemId, item.amount, item.customName);
        }
        delete offlineItems[player.name];
        world.setDynamicProperty("offlineItems", JSON.stringify(offlineItems));
    }

    const offlineScores = JSON.parse((world.getDynamicProperty("offlineScores") as string) || "{}");
    if (offlineScores[player.name]) {
        for (const [objective, value] of Object.entries(offlineScores[player.name])) {
            addScore(player, objective, value as number);
        }
        delete offlineScores[player.name];
        world.setDynamicProperty("offlineScores", JSON.stringify(offlineScores));
    }
}

export function saveData() {
    world.setDynamicProperty("auctions", JSON.stringify(auctions.map(a => ({
        ...a,
        seller: typeof a.seller === 'string' ? a.seller : a.seller.name,
        highestBidder: a.highestBidder ? (typeof a.highestBidder === 'string' ? a.highestBidder : a.highestBidder.name) : undefined
    }))));
}

export function loadData() {
    const data = world.getDynamicProperty("auctions");
    if (!data) {
        auctions = [];
        return;
    }

    auctions = JSON.parse(data as string) ?? [];
}

export { auctions };