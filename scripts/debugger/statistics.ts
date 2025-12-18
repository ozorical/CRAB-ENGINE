import { world, system, Player } from "@minecraft/server";


// unfinished pos

class DebugMonitor {
    private lastTickTime: number = 0;
    private tickTimes: number[] = [];
    private tickCount: number = 0;
    private tps: number = 20;
    private scriptPing: number = 0;
    private usageSmoothing: number[] = [];

    constructor() {
        this.lastTickTime = Date.now();
        system.runInterval(() => this.updateMonitor());
    }

    private updateMonitor() {
        const now = Date.now();
        this.scriptPing = now - this.lastTickTime;
        this.lastTickTime = now;
        
        this.updateTPS();
        
        const entities = world.getDimension("overworld").getEntities();
        const entityCount = entities.length;
        const rawUsage = this.calculateSystemUsage(entityCount);
        const systemUsage = this.smoothUsage(rawUsage);
        
        this.updateActionBar(entityCount, systemUsage);
    }

    private smoothUsage(currentUsage: number): number {
        this.usageSmoothing.push(currentUsage);
        if (this.usageSmoothing.length > 5) {
            this.usageSmoothing.shift();
        }
        return this.usageSmoothing.reduce((a, b) => a + b, 0) / this.usageSmoothing.length;
    }

    private updateTPS() {
        this.tickTimes.push(this.scriptPing);
        this.tickCount++;
        
        if (this.tickTimes.length > 20) {
            this.tickTimes.shift();
        }
        
        if (this.tickCount >= 20) {
            const averageTickTime = this.tickTimes.reduce((a, b) => a + b, 0) / this.tickTimes.length;
            this.tps = averageTickTime > 0 ? Math.min(20, 1000 / averageTickTime) : 20;
            this.tickCount = 0;
        }
    }

private calculateSystemUsage(entityCount: number): number {
    if (entityCount === 0) return 0;
    
    const MAX_RAW_USAGE = 168.5;
    const TARGET_PERCENT = 100; 
    const SCALE_FACTOR = TARGET_PERCENT / MAX_RAW_USAGE;

    const raw = 
        (entityCount * 0.15) + 
        (Math.max(0, entityCount - 10) * 0.4) + 
        (Math.max(0, entityCount - 100) * 0.2) + 
        (Math.max(0, entityCount - 200) * 0.1) +
        (Math.max(0, entityCount - 300) * 0.05);
    
    const baseUsage = raw * SCALE_FACTOR;
    
    const fluctuation = (Math.random() * 4 - 2) * SCALE_FACTOR;
    
    return Math.max(0, Math.min(100, baseUsage + fluctuation));
}

    private updateActionBar(entityCount: number, systemUsage: number) {
        const debugText = 
            `§l§5Nexus§8-§fEngine §eV4\n` +
            `§7Script: §f${this.scriptPing}ms\n` +
            `§7Entities: §f${entityCount}\n` +
            `§7Load: ${this.getUsageColor(systemUsage)}${systemUsage.toFixed(1)}%\n` +
            `§7TPS: ${this.getTpsColor(this.tps)}${this.tps.toFixed(1)}`;
        
        for (const player of world.getPlayers()) {
            if (player.hasTag('debug')) {
                player.onScreenDisplay.setActionBar(debugText);
            }
        }
    }

    private getUsageColor(usage: number): string {
        if (usage < 40) return '§a';
        if (usage < 65) return '§e';
        if (usage < 85) return '§6';
        if (usage < 100) return '§c';
        return '§4';            
    }

    private getTpsColor(tps: number): string {
        if (tps > 18.5) return '§a';
        if (tps > 16) return '§e'; 
        if (tps > 12) return '§6';
        return '§c';       
    }
}

new DebugMonitor();