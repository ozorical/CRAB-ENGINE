import { Player, world, system, Dimension } from "@minecraft/server";
import { ActionFormData, FormCancelationReason, ModalFormData } from "@minecraft/server-ui";
import { startWildTeleport } from "../helperFunctions/randomTP";
import { playSoundTo } from "../helperFunctions/sounds";
let overworld: Dimension;
const e = () => {
  overworld = world.getDimension("minecraft:overworld");
};

system.run(e);
/**
 * Displays a configuration UI for the player to adjust various settings.
 * @param {Player} player - The player opening the configuration UI.
 */
export function customMenu(player: Player): void {
  const colors: string[] = [
    `§l§fUnedited`,
    `§l§1Dark Blue`,
    `§l§2Dark Green`,
    `§l§3Cyan`,
    `§l§4Dark Red`,
    `§l§5Dark Pink`,
    `§l§6Gold`,
    `§l§7Grey`,
    `§l§8Dark Grey`,
    `§l§9Midnight Blue`,
    `§l§0Black`,
    `§l§aLime Green`,
    `§l§bBright Blue`,
    `§l§cBright Red`,
    `§l§dPink`,
    `§l§eYellow`,
    `§l§fWhite`,
    `§l§gDark Yellow`,
    `§l§uPurple`,
  ];
  new ModalFormData()
    .title(`§l${world.getDynamicProperty(`${player.name}_c1`)}Config`)
    .dropdown(`§l${world.getDynamicProperty(`${player.name}_c2`)}Main Color.\n§8Current: "§8${world.getDynamicProperty(`${player.name}_c1`)}Color§8"`, colors)
    .dropdown(`§l${world.getDynamicProperty(`${player.name}_c1`)}Second Color.\n§8Current: "§8${world.getDynamicProperty(`${player.name}_c2`)}Color§8"`, colors)
    .textField(`§l${world.getDynamicProperty(`${player.name}_c2`)}Prefix\n§o§8Note: Commands Prefix.\n§r§8Current: "§8${world.getDynamicProperty(`${player.name}_prefix`)}§8"`, `§8Text Here...`)
    .toggle(`§l${world.getDynamicProperty(`${player.name}_c2`)}Sidebar Visibility\n§o§8Note: if you can see the sidebar.\n§r§8Current: "§8${world.getDynamicProperty(`${player.name}_sidebar`)}§8`)
    .toggle(`§l${world.getDynamicProperty(`${player.name}_c1`)}Chat Visibility\n§o§8Note: if you can see new messages.\n§r§8Current: "§8${world.getDynamicProperty(`${player.name}_chat`)}§8`)
    .toggle(`§l${world.getDynamicProperty(`${player.name}_c2`)}Notification Visibility\n§o§8Note: if you can see new system messages / notifications.\n§r§8Current: "§8${world.getDynamicProperty(`${player.name}_system_messages`)}§8`)
    //Sidebar visibility, Chat visibility, notification send able.

    .submitButton(`§l§aDone!`)
    .show(player as any)
    .then((response) => {
      if (response.cancelationReason == FormCancelationReason.UserBusy) return customMenu(player);
      if (!response.canceled) {
        const [colorIndex1, colorIndex2, prefixInput, sidebarInput, chatInput, systemInput] = response.formValues as any[];

        const c1 = colors[colorIndex1] !== `§l§fUnedited` ? colors[colorIndex1].slice(2, 4) : undefined;
        const c2 = colors[colorIndex2] !== `§l§fUnedited` ? colors[colorIndex2].slice(2, 4) : undefined;
        const prefix = prefixInput?.trim() || undefined;
        const sidebar = Boolean(sidebarInput) || undefined;
        const chat = Boolean(chatInput) || undefined;
        const system = Boolean(systemInput) || undefined;

        if (c1) world.setDynamicProperty(`${player.name}_c1`, c1);
        if (c2) world.setDynamicProperty(`${player.name}_c2`, c2);
        if (prefix) world.setDynamicProperty(`${player.name}_prefix`, prefix);
        if (sidebar) world.setDynamicProperty(`${player.name}_sidebar`, sidebar);
        if (chat) world.setDynamicProperty(`${player.name}_chat`, chat);
        if (system) world.setDynamicProperty(`${player.name}_system`, system);
      }
    });
}
