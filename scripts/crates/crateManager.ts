import { Player, system } from "@minecraft/server";
import { commonCrate } from "./commonCrate";
import { mythicCrate } from "./mythicCrate";
import { rareCrate } from "./rareCrate";
import { advancedRelay } from "../protocol/protocol";

system.afterEvents.scriptEventReceive.subscribe((script) => {
  const { sourceEntity, id } = script;
  if (id == "crate:basic") {
    commonCrate(sourceEntity as Player);
    advancedRelay("1396652295785152584", `${Player.name} opened a **common crate**.`, "Crate Opened", "40D431");
  }
  if (id == "crate:rare") {
    rareCrate(sourceEntity as Player);
    advancedRelay("1396652295785152584", `${Player.name} opened a **rare crate**.`, "Crate Opened", "3183D4");
  }
  if (id == "crate:super") {
    mythicCrate(sourceEntity as Player);
    advancedRelay("1396652295785152584", `${Player.name} opened a **mythical crate**.`, "Crate Opened", "C531D4");
  }
});
