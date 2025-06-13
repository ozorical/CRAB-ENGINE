import { ItemStack, Player, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { auctions } from "./auctionManager";
import { formatItemId, getEnchantments } from "./helpers";
import { addScore, getScore, removeScore } from "../helperFunctions/getScore";
import { AuctionItem } from "./interfaces";
import { myAuctionsMenu } from "./playerAuctions";

const auctionsPerPage = 5;
const auctionDuration = 24 * 60 * 60 * 20;

const SOUNDS = {
  Activate: "beacon.activate",
  Chime: "note.chime",
  Error: "note.bit",
  Success: "random.levelup",
  Ping: "random.orb",
  BubblePop: "bubble.pop",
  RandomPop: "random.pop",
};


function formatTimeLeft(ticks: number): string {
  if (ticks <= 0) return "§cExpired";

  const hours = Math.floor(ticks / (20 * 60 * 60));
  const minutes = Math.floor((ticks % (20 * 60 * 60)) / (20 * 60));
  const seconds = Math.floor((ticks % (20 * 60)) / 20);

  return `§7Time Left: §e${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Displays the main auction house menu.
 * @param player - The player interacting with the auction house.
 */
export function auctionHouseMenu(player: Player) {
  const menu = new ActionFormData()
    .title("§cCrab§fSMP §8- §eAuction House")
    .body("§bBuy §7and §eSell §7items, blocks, and more from other players!")
    .button("§l§aList item§r\n§8[ §fAuction an item §8]", "textures/staff/view.png")
    .button("§l§6View Auctions§r\n§8[ §fView Auctions §8]", "textures/items/emerald.png")
    .button("§l§bStatus§r\n§8[ §fView Item Status §8]", "textures/items/map_filled.png");

  menu.show(player as any).then((response) => {
    if (response.canceled) {
      player.playSound(SOUNDS.Error);
      return;
    }

    player.playSound(SOUNDS.Activate);

    switch (response.selection) {
      case 0:
        listItemMenu(player);
        break;
      case 1:
        viewAuctionsMenu(player);
        break;
      case 2:
        myAuctionsMenu(player);
        break;
    }
  });
}

function listItemMenu(player: Player) {
  const invComponent = player.getComponent("inventory");
  if (!invComponent || !invComponent.container) {
    player.sendMessage("§cError: Unable to access your inventory.");
    player.playSound(SOUNDS.Error);
    return;
  }

  const container = invComponent.container;
  const items: ItemStack[] = [];

  for (let slot = 0; slot < container.size; slot++) {
    const item = container.getItem(slot);
    if (item && !item.typeId.toLowerCase().startsWith("crab:")) {
      items.push(item);
    }
  }

  if (items.length === 0) {
    player.sendMessage("§cNo items available to list.");
    player.playSound(SOUNDS.Error);
    return;
  }

  const itemList = items.map((item, index) => `${index + 1}. ${formatItemId(item.typeId)} x${item.amount}`);

  const menu = new ModalFormData().title("§cCrab§fSMP §8- §eList Item").dropdown("§aSelect Item", itemList, { defaultValueIndex: 0 }).textField("§6Starting Bid", "0", { defaultValue: "0" });

  menu.show(player as any).then((response) => {
    if (response.canceled) {
      player.playSound(SOUNDS.Error);
      return;
    }

    const selectedItemIndex = response.formValues![0] as number;
    const startingBid = parseInt(response.formValues![1] as string);

    if (isNaN(startingBid)) {
      player.sendMessage("§cPlease enter a valid number for the starting bid.");
      player.playSound(SOUNDS.Error);
      return;
    }

    if (startingBid < 1 || startingBid > 1000000) {
      player.sendMessage("§cStarting bid must be between §a$1§c and §a$1,000,000§c.");
      player.playSound(SOUNDS.Error);
      return;
    }

    if (startingBid < 1 || startingBid > 1000000) {
      player.sendMessage("§cStarting bid must be between §a$1§c and §a$1,000,000§c.");
      player.playSound(SOUNDS.Error);
      return;
    }

    const selectedItem = items[selectedItemIndex];
    if (!selectedItem) {
      player.sendMessage("§cInvalid item selection.");
      player.playSound(SOUNDS.Error);
      return;
    }

    let itemSlot = -1;
    for (let slot = 0; slot < container.size; slot++) {
      const item = container.getItem(slot);
      if (item && item.typeId === selectedItem.typeId && item.amount === selectedItem.amount) {
        itemSlot = slot;
        break;
      }
    }

    if (itemSlot === -1) {
      player.sendMessage("§cError: Could not find the selected item in your inventory.");
      player.playSound(SOUNDS.Error);
      return;
    }

    confirmListAuction(player, selectedItem, startingBid, itemSlot);
  });
}

function confirmListAuction(player: Player, item: ItemStack, startingBid: number, itemSlot: number) {
  const confirmMenu = new ModalFormData().title("§cCrab§fSMP §8- §eConfirm Listing").toggle(`§6List ${formatItemId(item.typeId)} x${item.amount} for §a${startingBid}§6?`, { defaultValue: false });

  confirmMenu.show(player as any).then((response) => {
    if (response.canceled || !response.formValues) {
      player.playSound(SOUNDS.Error);
      return;
    }

    const confirmListing = response.formValues[0] as boolean;
    if (confirmListing) {
      const container = player.getComponent("inventory")!.container!;
      container.setItem(itemSlot, undefined);

      auctions.push({
        seller: player,
        itemId: item.typeId,
        amount: item.amount,
        customName: item.nameTag,
        startingBid: startingBid,
        currentBid: startingBid,
        expiresAt: system.currentTick + auctionDuration,
        enchantments: getEnchantments(item),
      });

      player.sendMessage("§aItem listed on the auction house!");
      player.playSound(SOUNDS.Success);
    } else {
      player.sendMessage("§aAuction listing cancelled.");
      player.playSound(SOUNDS.RandomPop);
    }
  });
}

function viewAuctionsMenu(player: Player, page: number = 0) {
  const startIndex = page * auctionsPerPage;
  const endIndex = startIndex + auctionsPerPage;
  const displayedAuctions = auctions.slice(startIndex, endIndex);

  const menu = new ActionFormData().title("§cCrab§fSMP §8- §eAuctions").body(`§aPage ${page + 1} of ${Math.ceil(auctions.length / auctionsPerPage)}`);

  displayedAuctions.forEach((auction) => {
    const itemName = formatItemId(auction.itemId);
    const timeLeftText = formatTimeLeft(auction.expiresAt - system.currentTick);
    const buttonText = `§f${itemName}\n§a$${auction.currentBid} §8- §e${timeLeftText}`;
    menu.button(buttonText);
  });

  if (page > 0) {
    menu.button("§l§6Previous Page", "textures/ui/refresh_light");
  }
  if (endIndex < auctions.length) {
    menu.button("§l§aNext Page", "textures/ui/refresh_light");
  }

  menu.show(player as any).then((response) => {
    if (response.canceled) {
      player.playSound(SOUNDS.Error);
      return;
    }

    player.playSound(SOUNDS.Ping);

    const selectedIndex = response.selection;
    if (selectedIndex === undefined) return;

    if (page > 0 && selectedIndex === displayedAuctions.length) {
      viewAuctionsMenu(player, page - 1);
      return;
    }
    if (endIndex < auctions.length && selectedIndex === displayedAuctions.length + (page > 0 ? 1 : 0)) {
      viewAuctionsMenu(player, page + 1);
      return;
    }

    const selectedAuction = displayedAuctions[selectedIndex];
    if (!selectedAuction) {
      player.sendMessage("§cInvalid auction selection.");
      player.playSound(SOUNDS.Error);
      return;
    }

    showAuctionDetailsMenu(player, selectedAuction);
  });
}

function showAuctionDetailsMenu(player: Player, auction: AuctionItem) {
  const itemName = formatItemId(auction.itemId);
  const timeLeftText = formatTimeLeft(auction.expiresAt - system.currentTick);
  const sellerName = auction.seller.name;
  const currentBid = auction.currentBid;
  const startingBid = auction.startingBid;

  const menu = new ActionFormData()
    .title(`§cCrab§fSMP §8- §eItem Info`)
    .body(`§7Seller: §e${sellerName}\n` + `§7Starting Bid: §a$${startingBid}\n` + `§7Current Bid: §a$${currentBid}\n` + `§7Time Left: §e${timeLeftText}\n`)
    .button("§l§6Place Bid", "textures/items/emerald.png")
    .button("§l§eBack to Auctions", "textures/ui/refresh_light");

  menu.show(player as any).then((response) => {
    if (response.canceled) {
      player.playSound(SOUNDS.Error);
      return;
    }

    player.playSound(SOUNDS.Ping);

    switch (response.selection) {
      case 0:
        bidOnAuctionMenu(player, auction);
        break;
      case 1:
        viewAuctionsMenu(player);
        break;
    }
  });
}


function bidOnAuctionMenu(player: Player, auction: AuctionItem) {
  const menu = new ModalFormData().title("§cCrab§fSMP §8- §eBid on Auction").textField("§6Bid Amount", "0", { defaultValue: "0" });

  menu.show(player as any).then((response) => {
    if (response.canceled) {
      player.playSound(SOUNDS.Error);
      return;
    }

    const bidAmount = parseInt(response.formValues![0] as string);
    if (isNaN(bidAmount)) {
      player.sendMessage("§cPlease enter a valid number for the bid.");
      player.playSound(SOUNDS.Error);
      return;
    }

    if (bidAmount <= auction.currentBid) {
      player.sendMessage("§cYour bid must be higher than the current bid.");
      player.playSound(SOUNDS.Error);
      return;
    }

    if (getScore(player, "money")! < bidAmount) {
      player.sendMessage("§cYou don't have enough money for that bid.");
      player.playSound(SOUNDS.Error);
      return;
    }

    confirmBid(player, auction, bidAmount);
  });
}

function confirmBid(player: Player, auction: AuctionItem, bidAmount: number) {
  const confirmMenu = new ModalFormData().title("§cCrab§fSMP §8- §eConfirm Bid").toggle("§6Are you sure you want to place this bid?", { defaultValue: false });

  confirmMenu.show(player as any).then((response) => {
    if (response.canceled || !response.formValues) {
      player.playSound(SOUNDS.Error);
      return;
    }

    const confirmBid = response.formValues[0] as boolean;
    if (confirmBid) {
      if (auction.highestBidder) {
        addScore(auction.highestBidder, "money", auction.currentBid);
      }

      removeScore(player, "money", bidAmount);
      auction.currentBid = bidAmount;
      auction.highestBidder = player;

      player.sendMessage(`§aYou are now the highest bidder with a bid of $${bidAmount}!`);
      player.playSound(SOUNDS.Success);
    } else {
      player.sendMessage("§aBid cancelled.");
      player.playSound(SOUNDS.RandomPop);
    }
  });
}
