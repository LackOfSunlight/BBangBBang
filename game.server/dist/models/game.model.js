export class Game {
    players;
    // Map player ID to their assigned role
    playerRoles = new Map();
    constructor(players) {
        this.players = players;
        this.assignRoles();
    }
    assignRoles() {
        // Example role assignment logic, needs to be more robust
        const roles = ["Mafia", "Doctor", "Police", "Citizen"];
        const shuffledPlayers = [...this.players].sort(() => Math.random() - 0.5);
        shuffledPlayers.forEach((player, index) => {
            const role = roles[index % roles.length]; // Simple assignment
            this.playerRoles.set(player.id, role);
            console.log(`Player ${player.nickname} assigned role: ${role}`);
        });
    }
}
