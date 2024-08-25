export class Thread {
  threadID?: string = '';
  channelName: string = '';
  replyToMessage?: replyToMessage;

  constructor(obj: any) {
    this.threadID = obj.threadID || '';
    this.channelName = obj.channelName || '';
    this.replyToMessage = obj.replyToMessage
      ? new replyToMessage(obj.replyToMessage)
      : undefined;
  }

  getThreadJson() {
    return {
      threadID: this.threadID,
      channelName: this.channelName,
      replyToMessage: this.replyToMessage
        ? this.replyToMessage.getMessageJson()
        : null,
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

export class ThreadMessage {
  id: string = '';
  text: string = '';
  time: string = '';
  date: string = '';
  authorName: string = '';
  authorId: string = '';
  profileImg: string = '';
  reaction: string[] = [];
  file: string = '';
  isFirstMessageOfDay: boolean = false;
  authorImg?: string = ''; // Optional, for consistency with DmMessage
  authorstate?: string = ''; // Optional
  profileId?: string = ''; // Optional
  profileName?: string = ''; // Optional
  profileState?: string = ''; // Optional

  constructor(obj?: any) {
    this.id = obj ? obj.id : '';
    this.text = obj ? obj.text : '';
    this.time = obj ? obj.time : '';
    this.date = obj ? obj.date : '';
    this.authorName = obj ? obj.authorName : '';
    this.authorId = obj ? obj.authorId : '';
    this.profileImg = obj ? obj.profileImg : '';
    this.file = obj ? obj.file : '';
    this.id = obj ? obj.id : '';
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
      authorImg: this.authorImg, // Included even if optional
      authorstate: this.authorstate,
      profileId: this.profileId,
      profileName: this.profileName,
      profileImg: this.profileImg,
      profileState: this.profileState,
      reaction: this.reaction,
      file: this.file,
      isFirstMessageOfDay: this.isFirstMessageOfDay,
    };
  }
}
