export class Thread {
  threadID?: string = '';
  channelName: string = '';
  replyToMessage: replyToMessage[] = [];

  constructor(obj: any) {
    this.threadID = obj.threadID || '';
    this.channelName = obj.channelName || '';
    this.replyToMessage = obj.replyToMessage || [];
  }

  getThreadJson() {
    return {
      threadID: this.threadID,
      channelName: this.channelName,
      replyToMessage: this.replyToMessage,
    };
  }
}

export class replyToMessage {
  id: string = '';
  text: string = '';
  time: string = '';
  date: string = '';
  authorName: string = '';
  authorId: string = '';
  profileImage: string = '';
  isFirstMessageOfDay: boolean = false;

  constructor(obj?: any) {
    this.id = obj ? obj.id : '';
    this.text = obj ? obj.text : '';
    this.time = obj ? obj.time : '';
    this.date = obj ? obj.date : '';
    this.authorName = obj ? obj.authorName : '';
    this.authorId = obj ? obj.authorId : '';
    this.profileImage = obj ? obj.profileImage : '';
    this.isFirstMessageOfDay = obj ? obj.isFirstMessageOfDay || false : false;
  }

  getMessageJson() {
    return {
      id: this.id,
      text: this.text,
      time: this.time,
      date: this.date,
      authorName: this.authorName,
      authorId: this.authorId,
      profileImage: this.profileImage,
      isFirstMessageOfDay: this.isFirstMessageOfDay,
    };
  }
}
