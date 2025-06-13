import { world, ItemStack, system, Player, ItemType, Vector3 } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

export function donoMenu(player: Player) {
  let donoMenu = new ActionFormData()
    .title("§cCrab§fSMP §8- §eDonator")
    .body(
`§l§dDonator
§r§f- Chat Rank
- Lobby Trails
- Kill Effects
- No Cash Cooldowns
§eAvailable in ONE Realm Only!
§a£4.49 / $5.99 / 1 Boost

§l§dDonator§f+
§r§f- Chat Rank
- Lobby trails
- Kill effects
- Show / Hide UI
- Crab Pet
- No RTP Cooldowns
- No Cash Cooldowns
- and more!
§a£7.69 / $9.99 / 2 Boosts

§eAll purchases MUST be made through Discord! If you are wanting to Donate, Please open a General support ticket and a higher team member will deal with it.
§9discord.gg/crabsmp`
)
    .button("§l§4Close Menu§r\n§8[ §fExit the GUI §8]", "textures/blocks/barrier")
    .show(player as any);
}
