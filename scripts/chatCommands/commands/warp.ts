import { world, ItemStack, system, Player, ItemType, Vector3, Dimension } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { warpMenu, warpTeleport } from "../../guiPages/warps";

export function warpCommand(message: string, player: Player) {
  const args = message.split(" ");
  console.warn(args[1]);
  if (args.length == 1) {
    system.run(() => {
      warpMenu(player, true);
    });
  } else {
    system.run(() => {
      switch (args[1]) {
        case "spawn":
          warpTeleport(player, 0);
          break;
        case "wild":
          warpTeleport(player, 2);
          break;
        case "discord":
          warpTeleport(player, 5);
          break;
        case "nether":
          warpTeleport(player, 3);
          break;
        case "end":
          warpTeleport(player, 4);
          break;
        default:
          player.sendMessage("§cUnknown Warp Location");
          break;
      }
    });
  }
}
