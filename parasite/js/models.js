// models.js
export class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.role = null;
        this.isAlive = true;
        this.isLover = false;
        this.isPresident = false; // "ispresident" renommé en camelCase
        this.isProtected = false;
        this.votesAgainst = 0;
    }
}