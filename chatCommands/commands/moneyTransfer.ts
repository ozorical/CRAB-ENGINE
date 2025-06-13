import { Player, system, world } from "@minecraft/server";
import { FormCancelationReason, ModalFormData } from "@minecraft/server-ui";
import { addScore, getScore, removeScore } from "../../helperFunctions/getScore";
import { donoMenu } from "../../guiPages/donator";

const transferCooldowns = new Map<string, number>();

export function moneyTransfer(player: Player, isChat?: boolean, i?: number) {
  if (isChat) {
    i = 0;
  }

  if (!player.hasTag("donator") && !player.hasTag("donatorplus")) {
    const lastTransfer = transferCooldowns.get(player.id);
    const currentTime = Date.now();

    if (lastTransfer && currentTime - lastTransfer < 300000) {
      const remainingSeconds = Math.ceil((300000 - (currentTime - lastTransfer)) / 1000);
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      const timeLeft = `${minutes}m ${seconds}s`;
      player.sendMessage(`§cYou need §dDonator §cor §dDonator§f+ §cto transfer money that fast! You need to wait §e${timeLeft} §cbefore transferring money again`);
      donoMenu(player);
      return;
    }
  }

  let players = world.getAllPlayers();
  let playerNames = players.map((p) => p.name);

  let moneyTransferMenu = new ModalFormData()
    .title("§cCrab§fSMP §8- §eTransfer")
    .textField("Amount To Send", "0", { defaultValue: "0" })
    .dropdown("Player To Send To", playerNames, { defaultValueIndex: 0 })
    .show(player as any)
    .then((res) => {
      if (res.canceled && res.cancelationReason == FormCancelationReason.UserBusy && i != undefined) return moneyTransfer(player, false, i);
      let amount = parseInt(res.formValues![0] as string);
      if (isNaN(amount) || amount <= 0 || amount >= 100000) {
        player.sendMessage("§cPlease Enter A Valid Number Between 1 and 100,000");
        return;
      }
      if (getScore(player, "money")! <= amount) {
        player.sendMessage("§cYou Dont Have Enough Money For That");
        return;
      }
      let target = players[res.formValues![1] as number];

      player.sendMessage(`§fYou Sent §a$${amount} §fTo §e${target.name}`);
      target.sendMessage(`§e${player.name} §fSent §a$${amount} §fTo You`);
      target.runCommand(`summon fireworks_rocket`);
      removeScore(player, "money", amount);
      addScore(target, "money", amount);

      if (!player.hasTag("donator") && !player.hasTag("donatorplus")) {
        transferCooldowns.set(player.id, Date.now());
      }
    });
}
