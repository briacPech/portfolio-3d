// Simple store without external libraries

// Simple store without external libraries
class GameState {
  public currentIsland: string | null = null;
  public targetWaypoint: { id: string; position: { x: number, z: number } } | null = null;
  public boatPosition: { x: number, z: number } = { x: 0, z: 0 };
  private listeners: Set<() => void> = new Set();

  setIsland(islandId: string | null) {
    if (this.currentIsland !== islandId) {
      this.currentIsland = islandId;
      if (islandId) this.targetWaypoint = null; // Clear target when modal opens
      this.notify();
    }
  }

  setTargetWaypoint(id: string, x: number, z: number) {
    this.targetWaypoint = { id, position: { x, z } };
    this.currentIsland = null; // Close modal when starting to travel
    this.notify();
  }

  setBoatPosition(x: number, z: number) {
    this.boatPosition.x = x;
    this.boatPosition.z = z;
    // Don't notify on every frame to avoid massive re-renders, only components that need it will poll or we can throttle.
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const gameState = new GameState();
