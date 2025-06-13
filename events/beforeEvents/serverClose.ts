import { system } from "@minecraft/server";
import { saveData } from "../../auctionHouse/auctionManager";

system.beforeEvents.shutdown.subscribe(() => {
    saveData()
})