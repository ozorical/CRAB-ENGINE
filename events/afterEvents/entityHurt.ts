import { world } from "@minecraft/server";
import { pvpDamageTracker } from "../../quests/pvp/pvpTracker";

world.afterEvents.entityHurt.subscribe((e) => {
  pvpDamageTracker(e);
});
