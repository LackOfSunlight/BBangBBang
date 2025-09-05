class GameService {
    // This service could manage multiple active games if needed
    activeGames = new Map();
    // This service will be expanded with methods to handle game logic
    // based on packets received by gamePacketHandler.
    // Example method
    handlePlayerAction(gameId, playerId, action) {
        const game = this.activeGames.get(gameId);
        if (!game) {
            console.error(`Game with ID ${gameId} not found.`);
            return;
        }
        console.log(`Handling action for player ${playerId} in game ${gameId}`);
        // Delegate action to the specific game instance
        // game.processAction(playerId, action);
    }
}
// Export a singleton instance
export const gameService = new GameService();
