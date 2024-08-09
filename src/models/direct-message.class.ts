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
    id: string = '';
    profileImg: string = '';
    isFirstMessageOfDay: boolean = false;

    constructor(obj: any) {
        this.authorId = obj ? obj.authorId : '';
        this.authorName = obj ? obj.authorName : '';
        this.date = obj ? obj.date : '';
        this.time = obj ? obj.time : '';
        this.text = obj ? obj.text : '';
        this.reaction = obj ? obj.reaction : [];
        this.file = obj ? obj.file : '';
        this.id = obj ? obj.id : '';
        this.profileImg = obj ? obj.profileImg : '';
        this.isFirstMessageOfDay = obj ? obj.isFirstMessageOfDay || false : false;
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
            id: this.id,
            profileImg: this.profileImg,
            isFirstMessageOfDay: this.isFirstMessageOfDay,
        }
    }
}