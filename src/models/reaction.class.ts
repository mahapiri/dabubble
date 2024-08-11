export class Reaction {
    authorID: string = '';
    profileID: string = '';
    id: string = '';
    reaction: string = '';
    messageID: string = '';

    constructor(obj: any) {
        this.authorID = obj.authorID || '';
        this.profileID = obj.profileID || '';
        this.id = obj.id || '';
        this.reaction = obj.reaction || '';
        this.messageID = obj.messageID || '';
    }

    getJson() {
        return {
            authorID: this.authorID,
            id: this.id,
            profileID: this.profileID,
            reaction: this.reaction,
            messageID: this.messageID,
        }
    }
}