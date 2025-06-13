import { EnchantmentType, ItemStack, ItemEnchantableComponent, ItemDurabilityComponent } from '@minecraft/server';

const { defineProperties } = Object;

interface EnchantmentInfo {
    name: string;
    level: number;
    maxLevel: number;
}

defineProperties(ItemStack.prototype, {
    setNewLore: {
        value(lore: string[]): void {
            const newLore = lore.reduce((result: string[], element: string) => {
                const lastChunk = result[result.length - 1];
                if (!lastChunk || (lastChunk.length + element.length + 2) > 50) {
                    result.push(element.slice(0, 50));
                } else {
                    const combinedLength = lastChunk.length + element.length + 2;
                    if (combinedLength <= 50) {
                        result[result.length - 1] += `\n${element}`;
                    } else {
                        result.push(element.slice(0, 50));
                    }
                }
                return result;
            }, []);
            try {
                this.setLore(newLore);
            } catch (e) {
                console.warn("Failed to set lore:", e);
            }
        }
    },
    getNewLore: {
        value(): string[] {
            return this.getLore().flatMap((v: string) => v.split('\n'));
        }
    },
    enchants: {
        get(): ItemEnchantableComponent | undefined {
            return this.getComponent('enchantable');
        }
    },
    isEnchanted: {
        get(): boolean {
            return this.getComponent('enchantable')?.getEnchantments()?.length > 0;
        }
    },
    durability: {
        get(): ItemDurabilityComponent | undefined {
            return this.getComponent('durability');
        }
    },
    getEnchants: {
        value(): EnchantmentInfo[] {
            const enchantments = this.getComponent('enchantable')?.getEnchantments();
            return enchantments?.map((v: { type: EnchantmentType; level: number }) => ({
                name: v.type.id.charAt(0).toUpperCase() + v.type.id.slice(1), // Capitalize the first letter
                level: v.level,
                maxLevel: v.type.maxLevel
            })) ?? [];
        }
    },
});