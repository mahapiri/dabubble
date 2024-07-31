export class Channel {
  channelID?: string = '';
  channelName: string = '';
  channelMember: ChannelMember[] = [];
  createdBy: string = '';
  description: string = '';
  messages?: ChannelMessages[] = [];

  constructor(obj?: any) {
    this.channelID = obj ? obj.channelID : '';
    this.channelName = obj ? obj.channelName : '';
    this.channelMember = obj ? obj.channelMember : [];
    this.createdBy = obj ? obj.createdBy : '';
    this.description = obj ? obj.description : '';
    this.messages = obj ? obj.messages : [];
  }

  getChannelJson() {
    return {
      channelID: this.channelID,
      channelName: this.channelName,
      channelMember: this.channelMember,
      createdBy: this.createdBy,
      description: this.description,
      messages: this.messages,
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

export class ChannelMessages {
  id: string = '';
  text: string = '';
  time: string = '';
  date: string = '';
  authorName: string = '';
  authorId: string = '';
  profileImage: string = '';
}
