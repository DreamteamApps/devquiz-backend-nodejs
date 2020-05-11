class DTOUser {
    constructor(model) {
        const { id, username, name, image_url, repos_quantity, score, wins, losses, ties } = model;

        this.id = id;
        this.login = username;
        this.name = name;
        this.avatar = image_url;
        this.repos = repos_quantity;
        this.score = score;
        this.wins = wins;
        this.losses = losses;
        this.ties = ties;
    }
}

module.exports = DTOUser;