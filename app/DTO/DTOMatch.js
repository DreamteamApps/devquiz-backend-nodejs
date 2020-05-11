class DTOMatch {
    constructor(fileModel) {
        const { id, name, extension, duration, url } = fileModel;

        this.id = id;
        this.name = name;
        this.extension = extension;
        this.duration = duration;
        this.url = url;
    }
}

module.exports = DTOMatch;