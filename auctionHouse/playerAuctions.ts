import { ItemStack, Player, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { auctions } from "./auctionManager";
import { formatItemId } from "./helpers";
import { giveItem } from "../helperFunctions/inventory";
import { addScore } from "../helperFunctions/getScore";
import { AuctionItem } from "./interfaces";

const auctionsPerPage = 5;
const auctionDuration = 24 * 60 * 60 * 20; // 24 hours in ticks


function getItemTexturePath(itemId: string): string {
  const itemName = itemId.replace("minecraft:", ""); // Remove the "minecraft:" prefix
  return `textures/items/${itemName}.png`; // Default to items folder
}

function formatTimeLeft(ticks: number): string {
  if (ticks <= 0) return "§cExpired";

  const hours = Math.floor(ticks / (20 * 60 * 60));
  const minutes = Math.floor((ticks % (20 * 60 * 60)) / (20 * 60));
  const seconds = Math.floor((ticks % (20 * 60)) / 20);

  return `§7Time Left: §e${hours}h ${minutes}m ${seconds}s`;
}

export function myAuctionsMenu(player: Player, page: number = 0) {
  const myAuctions = auctions.filter((auction) => auction.seller.id === player.id);

  if (myAuctions.length === 0) {
    player.sendMessage("§cYou have no active auctions.");
    return;
  }

  const now = system.currentTick;

  const startIndex = page * auctionsPerPage;
  const endIndex = startIndex + auctionsPerPage;
  const displayedAuctions = myAuctions.slice(startIndex, endIndex);

  const menu = new ActionFormData().title("§cCrab§fSMP §8- §eAuction Status").body(`§6Track §7and §breturn §7your auctions that you have listed!\n\n§aPage ${page + 1} of ${Math.ceil(myAuctions.length / auctionsPerPage)}`);

  displayedAuctions.forEach((auction) => {
    const itemName = formatItemId(auction.itemId);
    const timeLeftText = formatTimeLeft(auction.expiresAt - now);
    const buttonText = `§f${itemName}\n§a$${auction.currentBid} §8- ${timeLeftText}`;
    menu.button(buttonText);
  });

  if (page > 0) {
    menu.button("§l§cPrevious Page", "textures/ui/refresh_light");
  }
  if (endIndex < myAuctions.length) {
    menu.button("§l§aNext Page", "textures/ui/refresh_light");
  }

  menu.show(player as any).then((response) => {
    if (response.canceled || response.selection === undefined) return;

    const selectedIndex = response.selection;

    if (page > 0 && selectedIndex === displayedAuctions.length) {
      myAuctionsMenu(player, page - 1);
      return;
    }
    if (endIndex < myAuctions.length && selectedIndex === displayedAuctions.length + (page > 0 ? 1 : 0)) {
      myAuctionsMenu(player, page + 1);
      return;
    }

    const selectedAuction = displayedAuctions[selectedIndex];
    if (!selectedAuction) {
      player.sendMessage("§cInvalid auction selection.");
      return;
    }

    if (selectedAuction.expiresAt <= now) {
      confirmEndAuction(player, selectedAuction);
    } else {
      player.sendMessage("§cThis auction has not yet expired.");
    }
  });
}

function confirmEndAuction(player: Player, auction: AuctionItem) {
  const confirmMenu = new ModalFormData().title("§cCrab§fSMP §8- §eEnd Auction").toggle("§6Are you sure you want to end this auction?", { defaultValue: false });

  confirmMenu.show(player as any).then((response) => {
    if (response.canceled || !response.formValues) return;

    const confirmEnd = response.formValues[0] as boolean;
    if (confirmEnd) {
      endAuctionMenu(player, auction);
    } else {
      player.sendMessage("§aAuction cancellation aborted.");
    }
  });
}

function endAuctionMenu(player: Player, auction: AuctionItem) {
  if (auction.highestBidder) {
    giveItem(auction.highestBidder, auction.itemId, auction.amount, auction.customName ?? "");
    addScore(auction.seller, "money", auction.currentBid);
    player.sendMessage(`§aAuction ended! You received $${auction.currentBid}.`);
  } else {
    giveItem(auction.seller, auction.itemId, auction.amount, auction.customName ?? "");
    player.sendMessage("§aAuction ended with no bids. Your item has been returned.");
  }

  const auctionIndex = auctions.indexOf(auction);
  if (auctionIndex !== -1) {
    auctions.splice(auctionIndex, 1);
  }
}
