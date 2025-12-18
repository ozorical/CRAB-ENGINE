import { Player } from "@minecraft/server";

export interface AuctionItem {
  seller: Player;
  itemId: string;
  amount: number;
  customName?: string;
  startingBid: number;
  currentBid: number;
  highestBidder?: Player;
  expiresAt: number;
  enchantments?: { id: string, level: number }[];
}