import { system } from "@minecraft/server";
import { auctionHouseMenu } from "./menus";
import { checkExpiredAuctions } from "./auctionManager";
import { myAuctionsMenu } from "./playerAuctions";

system.runInterval(() => {
  checkExpiredAuctions();
}, 1200);

export { auctionHouseMenu };
