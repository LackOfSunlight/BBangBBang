export class Player {
    id;
    nickname;
    socket;
    constructor(id, nickname, socket) {
        this.id = id;
        this.nickname = nickname;
        this.socket = socket;
    }
}
