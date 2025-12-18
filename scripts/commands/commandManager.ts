import { CommandPermissionLevel, CommandResult, CustomCommandParamType, CustomCommandStatus, Player, system, world } from "@minecraft/server";
import { CommandRegister } from "./commandClass";

system.beforeEvents.startup.subscribe((event) => {
  //?   Register the command with the command manager
  //     new CommandRegister("alpha:test", "Test Command", CommandPermissionLevel.Any, undefined, [{ name: "test", type: CustomCommandParamType.String }])
  //       .cmdFunction((origin, args) => {
  //?   Command logic goes here
  //     (origin.initiator! as Player).sendMessage(`Test command executed with argument: ${args}`);
  //     return { status: CustomCommandStatus.Success };
  //   })
  //   .registerCommand(event);
});
