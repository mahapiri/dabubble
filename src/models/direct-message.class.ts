export class DirectMessage {
    directMessageID: string = '';
    userIDs: string[] = [];
    messages: string[] = [];

    constructor(obj: any) {
        this.directMessageID = obj.directMessageID || '';
        this.userIDs = obj.userIDs || [];
        this.messages = obj.messages || [];
    }

    getDirectMessageJson() {
        return {
            directMessageID: this.directMessageID,
            userIDs: this.userIDs,
            messages: this.messages
        }
    }
}