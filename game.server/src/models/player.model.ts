import { Socket } from "net";

export class Player {
  constructor(
    public id: string,
    public nickname: string,
    public socket: Socket
  ) {}

  // Add player-specific properties and methods here
  // e.g., role, character, items, etc.
}
