import { Player, world } from "@minecraft/server";
import { ModalFormData, ModalFormResponse } from "@minecraft/server-ui";

export function playerSelect(player: Player) {
  let players = world.getAllPlayers();
  let playerNames = players.map((p) => p.name);

  let playerList = new ModalFormData()
    .title("§cSelect Inventory To View")
    .dropdown("Player", playerNames, { defaultValueIndex: 0 })
    .show(player as any)
    .then((res: ModalFormResponse) => {
      let target = players[res.formValues![0] as number];
      return target;
    });
}
