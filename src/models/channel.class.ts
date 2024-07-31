export class Channel {
  channelID?: string = '';
  channelName: string = '';
  channelMember: ChannelMember[] = [];
  createdBy: string = '';
  description: string = '';

  constructor(obj: any) {
    this.channelID = obj.channelID || '';
    this.channelName = obj.channelName || '';
    this.channelMember = obj.channelMember || [];
    this.createdBy = obj.createdBy || '';
    this.description = obj.description || '';
  }

  getChannelJson() {
    return {
      channelID: this.channelID,
      channelName: this.channelName,
      channelMember: this.channelMember,
      createdBy: this.createdBy,
      description: this.description,
    };
  }
}

export class ChannelMember {
  email: string = '';
  profileImage: string = '';
  state: string = '';
  userChannels: string[] = [];
  userId: string = '';
  username: string = '';
}

export class ChannelMessage {
  id: string = '';
  text: string = '';
  time: string = '';
  date: string = '';
  authorName: string = '';
  authorId: string = '';
  profileImage: string = '';

  constructor(obj?: any) {
    this.id = obj ? obj.id : '';
    this.text = obj ? obj.text : '';
    this.time = obj ? obj.time : '';
    this.date = obj ? obj.date : '';
    this.authorName = obj ? obj.authorName : '';
    this.authorId = obj ? obj.authorId : '';
    this.profileImage = obj ? obj.profileImage : '';
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
    };
  }
}
