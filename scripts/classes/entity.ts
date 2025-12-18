import { Entity, Player, world, GameMode, EquipmentSlot, EntityComponent, EntityInventoryComponent, Container, EntityEquippableComponent, ItemStack, Dimension, Vector3, WorldSoundOptions } from '@minecraft/server';
const { defineProperties } = Object;

const armourSlots: EquipmentSlot[] = [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet];

enum MemoryTier {
    Undetermined = 0,
    SuperLow = 1,
    Low = 2,
    Mid = 3,
    High = 4,
    SuperHigh = 5
}

defineProperties(Entity.prototype, {
    health: { get(): EntityComponent | undefined { return this.getComponent('health'); } },
    inventory: { get(): EntityInventoryComponent | undefined { return this.getComponent('inventory'); } },
    container: { get(): Container | undefined { return this.getComponent('inventory')?.container; } },
    armor: { get(): EntityEquippableComponent | undefined { return this.getComponent('equippable'); } },
    setScore: {
        value(objective: string, amount: number, add: boolean = false): number {
            try {
                const scoreObj = world.scoreboard.getObjective(objective);
                const score = (add ? scoreObj?.getScore(this) ?? 0 : 0) + amount;
                scoreObj?.setScore(this, score);
                return score;
            } catch (e) {
                console.warn(e);
                return 0;
            }
        }
    },
    getScore: {
        value(objective: string): number {
            try {
                return (world.scoreboard.getObjective(objective))?.getScore(this) ?? 0;
            } catch (e) {
                console.warn(e);
                return 0;
            }
        }
    },
});

defineProperties(Player.prototype, {
    kd: {
        get(): string {
            if (this.getScore(`deaths`) === 0) return this.getScore(`kills`).toFixed(2);
            if (!this.getScore(`kills`)) return "0.00";
            return (Number(this.getScore(`kills`).toFixed(2)) / Number(this.getScore(`deaths`).toFixed(2))).toFixed(2);
        }
    },
    inPvp: {
        get(): boolean {
            return this.hasTag(`combat`) /*|| this.isOp()*/;
        }
    },
    isStaff: {
        get(): boolean {
            return this.hasTag(`staffstatus`) /*|| this.isOp()*/;
        }
    },
    // player db thing
    pid: {
        get(): string {
            return this.getDynamicProperty('perm_id') ?? (this.setDynamicProperty(this.id), this.id);
        }
    },
    mainhand: {
        get(): ItemStack | undefined { return this.armor?.getEquipment(EquipmentSlot.Mainhand); },
        set(s: ItemStack | undefined): ItemStack | undefined { this.armor?.setEquipment(EquipmentSlot.Mainhand, s); return s; }
    },
    alert: {
        value(message: string, messageColour: string = 'f', bold: boolean = false, system: boolean = false, sound?: string, pitch: number = 1.0): void {
            const bC = bold ? '§l' : '';
            const editedMsg = message.replace(/§R/g, '§r' + bC + '§' + messageColour);
            if (!messageColour || messageColour == ``) this.sendMessage(`§l§f(${messageColour}${system ? 'SYS' : '!'}§f) §r${bC + '§f' + editedMsg}`);
            else this.sendMessage(`§l§f(§${messageColour}${system ? 'SYS' : '!'}§f) §r${bC + '§' + messageColour + editedMsg}`);

            if (sound)
                this.playSound(sound, { pitch: pitch });
        }
    },
    offhand: {
        get(): ItemStack | undefined { return this.armor?.getEquipment(EquipmentSlot.Offhand); },
        set(s: ItemStack | undefined): ItemStack | undefined { this.armor?.setEquipment(EquipmentSlot.Offhand, s); return s; }
    },
    getArmor: {
        value(): (ItemStack | undefined)[] {
            const comp = this.armor;
            return armourSlots.map(v => comp?.getEquipment(v));
        }
    },
    giveItem: {
        value(itemStack: ItemStack): void {
            const remainingItems = this.container?.addItem(itemStack);
            if (remainingItems)
                this.dimension.spawnItem(remainingItems, this.location);
        }
    },
});


