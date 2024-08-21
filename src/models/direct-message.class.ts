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
    authorImg: string = '';
    authorstate: string = '';
    profileId: string = '';
    profileName: string = '';
    profileImg: string = '';
    profileState: string = '';
    date: string = '';
    time: string = '';
    text: string = '';
    reaction: string[] = [];
    file: string = '';
    id: string = '';
    isFirstMessageOfDay: boolean = false;

    constructor(obj: any) {
        this.authorId = obj ? obj.authorId : '';
        this.authorName = obj ? obj.authorName : '';
        this.authorImg = obj ? obj.authorImg : '';
        this.authorstate = obj ? obj.authorstate : '';
        this.profileId = obj ? obj.profileId : '';
        this.profileName = obj ? obj.profileName : '';
        this.profileImg = obj ? obj.profileImg : '';
        this.profileState = obj ? obj.profileState : '';
        this.date = obj ? obj.date : '';
        this.time = obj ? obj.time : '';
        this.text = obj ? obj.text : '';
        this.reaction = obj ? obj.reaction : [];
        this.file = obj ? obj.file : '';
        this.id = obj ? obj.id : '';
        this.isFirstMessageOfDay = obj ? obj.isFirstMessageOfDay || false : false;
    }

    getMessageJson() {
        return {
            authorId: this.authorId,
            authorName: this.authorName,
            authorImg: this.authorImg,
            authorstate: this.authorstate,
            profileId: this.profileId,
            profileName: this.profileName,
            profileImg: this.profileImg,
            profileState: this.profileState,
            date: this.date,
            time: this.time,
            text: this.text,
            reaction: this.reaction,
            file: this.file,
            id: this.id,
            isFirstMessageOfDay: this.isFirstMessageOfDay,
        }
    }
}