import { Player, world, system, Dimension } from "@minecraft/server";
import { ActionFormData, FormCancelationReason, ModalFormData } from "@minecraft/server-ui";
import { startWildTeleport } from "../helperFunctions/randomTP";
import { playSoundTo } from "../helperFunctions/sounds";
let overworld: Dimension;
const e = () => {
  overworld = world.getDimension("minecraft:overworld");
};

system.run(e);

function discordKitForm(player: Player, isChat?: boolean, i?: number) {
  let discordForm = new ActionFormData()
    .title("§cCrab§fSMP §8- §eDiscord Kit")
    .body("Select an option below:\n§7Code in §e#discord-kit\n§9discord.gg/crabsmp")
    .button("§l§7Warp§r\n§8[ §fWarp to Discord vault §8]§r", "textures/gui/menu/vault")
    .button("§l§9Enter code§r\n§8[ §fEnter code manually §8]§r", "textures/gui/menu/discord")
    .button("§l§4Close Menu§r\n§8[ §fExit the GUI §8]", "textures/blocks/barrier")
    .show(player as any)
    .then((res) => {
      if (res.canceled && res.cancelationReason == FormCancelationReason.UserBusy) return discordKitForm(player);
      if (res.selection == 0) {
        playSoundTo(player, "RandomPop");
        player.teleport({ x: 19926, y: 67, z: 19846 }, { dimension: overworld });
      }
      if (res.selection == 1) {
        playSoundTo(player, "RandomPop");
        discordClaim(player);
      }
    });
}

function discordClaim(player: Player) {
  if (player.hasTag("discordKit")) {
    player.sendMessage("§cYou Have Already Claimed The Discord Kit");
    return;
  }
  let codeForm = new ModalFormData()
    .title("§cCrab§fSMP §8- §eDsc Kit")
    .textField("Enter Code From Discord Here", "000", { defaultValue: "0" })
    .show(player as any)
    .then((res) => {
      let code = res.formValues![0] as string;
      if (code == "483") {
        world.sendMessage(`§9${player.name} Claimed Their Discord Kit`);
        world.structureManager.place("mystructure:discordkit", player.dimension, { x: player.location.x, y: player.location.y, z: player.location.z });
        player.addTag("discordKit");
      } else {
        player.sendMessage("§cThat Is The Wrong Code, Try Again");
      }
    });
}

export { discordKitForm };
