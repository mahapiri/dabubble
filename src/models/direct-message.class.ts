export class DirectMessage {
    directMessageID: string = '';
    userIDs: string[] = [];

    constructor(obj: any) {
        this.directMessageID = obj.directMessageID || '';
        this.userIDs = obj.userIDs || [];
    }

    getDirectMessageJson() {
        return {
            directMessageID: this.directMessageID,
            userIDs: this.userIDs,
        }
    }
}

export class DmMessage {
    authorId: string = '';
    authorName: string = '';
    date: string = '';
    time: string = '';
    text: string = '';
    reaction: string[] = [];
    file: string = '';

    constructor(obj: any) {
        this.authorId = obj.authorId || '';
        this.authorName = obj.authorName || '';
        this.date = obj.date || '';
        this.time = obj.time || '';
        this.text = obj.text || '';
        this.reaction = obj.reaction || [];
        this.file = obj.file || '';
    }

    getMessageJson() {
        return {
            authorId: this.authorId,
            authorName: this.authorName,
            date: this.date,
            time: this.time,
            text: this.text,
            reaction: this.reaction,
            file: this.file,
        }
    }
}