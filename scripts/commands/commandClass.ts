import { CommandPermissionLevel, CustomCommandParameter, StartupEvent, CustomCommandOrigin, CustomCommandResult } from "@minecraft/server";

export class CommandRegister {
  commandName: string;
  commandDescription: string;
  commandPermissionLevel: CommandPermissionLevel;
  commandOptionalParams?: CustomCommandParameter[];
  commandParams?: CustomCommandParameter[];
  callbackFn: (origin: CustomCommandOrigin, ...args: any[]) => CustomCommandResult;

  constructor(commandName: string, commandDescription: string, commandPermissionLevel: CommandPermissionLevel, commandOptionalParams?: CustomCommandParameter[], commandParams?: CustomCommandParameter[]) {
    this.commandName = commandName;
    this.commandDescription = commandDescription;
    this.commandPermissionLevel = commandPermissionLevel;
    this.commandOptionalParams = commandOptionalParams ?? undefined;
    this.commandParams = commandParams ?? undefined;
  }

  public cmdFunction(fn: (origin: CustomCommandOrigin, ...args: any[]) => CustomCommandResult) {
    this.callbackFn = fn;
    return this;
  }

  public registerCommand(startup: StartupEvent) {
    startup.customCommandRegistry.registerCommand(
      {
        name: this.commandName,
        description: this.commandDescription,
        permissionLevel: this.commandPermissionLevel,
        optionalParameters: this.commandOptionalParams,
        mandatoryParameters: this.commandParams,
      },
      this.callbackFn
    );
  }
}
