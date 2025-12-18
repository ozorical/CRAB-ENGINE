import { world, ItemStack, system, Player, ItemType, Vector3 } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

export function infoMenu(player: Player) {
  let infoMenu = new ActionFormData()
    .title("§5Nexus§fSMP §8- §eInfo")
    .body(
      "§r§7NexusSMP is a server network owned by Ozorical, Adem, Inset, and Christian. We strive for greatness, with a massive playerbase!\n\n§aIP: §fplay.nexussmp.xyz\n§cPort: §f19132\n§9Discord code: §fnexussmp\n "
    )
    .button("§l§4Close Menu\n§r§8[ §fExit the GUI §8]", "textures/blocks/barrier")
    .show(player as any);
}