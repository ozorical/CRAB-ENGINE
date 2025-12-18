import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { advancedRelay } from "../protocol/protocol";

export function settingsMenu(player: Player) {
  const chatDisabled = player.hasTag("nochat");
  const sidebarDisabled = player.hasTag("nosidebar");
  const serverMessagesDisabled = player.hasTag("noservermessages");
  const particlesDisabled = player.hasTag("noparticles");

  const chatToggleLabel = `§l§fChat: ${chatDisabled ? "§4OFF" : "§aON"}`;
  const sidebarToggleLabel = `§l§fSidebar: ${sidebarDisabled ? "§4OFF" : "§aON"}`;
  const serverMessagesToggleLabel = `§l§fServer Messages: ${serverMessagesDisabled ? "§4OFF" : "§aON"}`;
  const particlesToggleLabel = `§l§fParticle Trails: ${particlesDisabled ? "§4OFF" : "§aON"}`;

  let guiMenu = new ModalFormData()
    .title("§5Nexus§fSMP §8- §eSettings")
    .toggle(sidebarToggleLabel, { defaultValue: !sidebarDisabled })
    .toggle(chatToggleLabel, { defaultValue: !chatDisabled })
    .toggle(serverMessagesToggleLabel, { defaultValue: !serverMessagesDisabled })
    .toggle(particlesToggleLabel, { defaultValue: !particlesDisabled })
    .show(player as any)
    .then((res) => {
      if (res.canceled) return;

      const [sidebarToggle, chatToggle, serverMessagesToggle, particlesToggle] = res.formValues as [boolean, boolean, boolean, boolean];

      if (sidebarToggle !== !sidebarDisabled) {
        if (player.hasTag("donatorplus")) {
          if (!sidebarToggle) {
            player.addTag("nosidebar");
            player.sendMessage("§aYou turned off the sidebar.");
            advancedRelay("1396663161138188318", `${player.name} turned off their sidebar`, "Sidebar Update", "EE0F0F");
          } else {
            player.removeTag("nosidebar");
            player.sendMessage("§aYou turned on the sidebar.");
            advancedRelay("1396663161138188318", `${player.name} turned on their sidebar`, "Sidebar Update", "31D43D");
          }
        } else {
          donoMenu(player);
          return;
        }
      }

      if (chatToggle !== !chatDisabled) {
        if (!chatToggle) {
          player.addTag("nochat");
          player.sendMessage("§aYou turned off chat.");
          advancedRelay("1396663161138188318", `${player.name} turned off their chat`, "Chat Update", "EE0F0F");
        } else {
          player.removeTag("nochat");
          player.sendMessage("§aYou turned on chat.");
          advancedRelay("1396663161138188318", `${player.name} turned on their chat`, "Chat Update", "31D43D");
        }
      }

      if (serverMessagesToggle !== !serverMessagesDisabled) {
        if (!serverMessagesToggle) {
          player.addTag("noservermessages");
          player.sendMessage("§aYou turned off server messages.");
          advancedRelay("1396663161138188318", `${player.name} turned off their server messages`, "Server Messages Update", "EE0F0F");
        } else {
          player.removeTag("noservermessages");
          player.sendMessage("§aYou turned on server messages.");
          advancedRelay("1396663161138188318", `${player.name} turned on their server messages`, "Server Messages Update", "31D43D");
        }
      }

      if (particlesToggle !== !particlesDisabled) {
        if (player.hasTag("donatorplus")) {
          if (!particlesToggle) {
            player.addTag("noparticles");
            player.sendMessage("§aYou turned off particle trails.");
            advancedRelay("1396663161138188318", `${player.name} turned off their particle trails`, "Particle Update", "EE0F0F");
          } else {
            player.removeTag("noparticles");
            player.sendMessage("§aYou turned on particle trails.");
            advancedRelay("1396663161138188318", `${player.name} turned on their particle trails`, "Particle Update", "31D43D");
          }
        } else {
          donoMenu(player);
          return;
        }
      }
    });
}

function donoMenu(player: Player) {
  player.sendMessage("§cYou need §dDonator§f+ §cto access this feature!");
}
