import * as mc from '@minecraft/server';
import * as ui from '@minecraft/server-ui';

declare module "@minecraft/server" {
	interface Entity {
		/**
		 * Returns the health component of the entity.
		 */
		readonly health: EntityHealthComponent;
		/**
		 * Returns the inventory component of the entity.
		 */
		readonly inventory: EntityInventoryComponent;
		/**
		 * Returns the inventory container of the entity.
		 */
		readonly container: Container;
		/**
		 * Returns the inventory component of the entity.
		 */
		readonly armor?: EntityEquippableComponent;
		/**
		 * Sets a score for an entity.
		 * @param objective The objective to change the score on.
		 * @param amount The new amount on the objective.
		 * @param add If the new value should stack with the old one.
		 * @returns The new value of the score.
		 */
		setScore(objective: string, amount: number, add?: boolean): number;
		/**
		 * Gets a score for an entity.
		 * @param objective The objective to get the score of.
		 */
		getScore(objective: string): number;
	}
	interface Player {
		/**
		 * Returns the item in the main hand. 
		 */
		mainhand: ItemStack | undefined;
		/**
		 * Returns the item in the offhand. 
		 */
		offhand: ItemStack | undefined;
		/**
		 * Returns an array of the currently worn armor. Use .armor.getEquipment() for single pieces.
		 */
		getArmor(): (ItemStack | undefined)[];
		/**
		 * The current gamemode of the player, of either 'adventure', 'creative', 'spectator', 'survival', or 'default'.
		 */
		getGamemode(): string;
		/**
		 * Overflows the items onto the floor if inventory is full & sends a chat warning.
		 * @param itemStack The items to overflow.
		 */
		giveItem(itemStack: ItemStack): void;
		/**
		 * Alerts the player with a message. Use §R to reset the colour to the given params.
		 * @param message The message itself.
		 * @param messageColour The colour of the message, section included. Default is white (§f).
		 * @param bold If the message should be bolded (§l).
		 * @param system If the message should start with SYS instead of !.
		 * @param sound If the alert has sound. Try note.pling or random.orb.
		 * @param pitch The pitch of the above sound.
		 */
		alert(message: string, messageColour?: string, bold?: boolean, system?: boolean, sound?: string, pitch?: number): void;
	}
	interface World {
		/**
		 * The overworld dimension.
		 */
		readonly overworld: Dimension;
		/**
		 * The nether dimension.
		 */
		readonly nether: Dimension;
		/**
		 * The end dimension.
		 */
		readonly theEnd: Dimension;
	}
	interface ItemStack {
		/**
		 * If the item has enchants applied or not.
		 */
		readonly isEnchanted: boolean;
		/**
		 * Returns the enchantment component of this item stack.
		 */
		readonly enchants: ItemEnchantableComponent | undefined;
		/**
		 * Returns the durability component of this item stack.
		 */
		readonly durability: ItemDurabilityComponent | undefined;
		/**
		 * Tries to set lore to an item while conforming to the lore limits
		 * @param lore The lore to set
		 */
		setNewLore(lore: string[]): void;
		/**
		 * Gets the lore on an item that is conformed to the lore limits
		 */
		getNewLore(): string[];
	}
}
