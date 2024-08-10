export class Reaction {
    authorID: string = '';
    profileID: string = '';
    id: string = '';
    reaction: string = '';
    messageId: string = '';

    constructor(obj: any) {
        this.authorID = obj.authorID || '';
        this.profileID = obj.profileID || '';
        this.id = obj.id || '';
        this.reaction = obj.reaction || '';
        this.messageId = obj.messageId || '';
    }

    getJson() {
        return {
            authorID: this.authorID,
            id: this.id,
            profileID: this.profileID,
            reaction: this.reaction,
            messageId: this.messageId,
        }
    }
}