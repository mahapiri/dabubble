export class Channel {
  channelID?: string = '';
  channelName: string = '';
  channelMember: ChannelMember[] = [];
  createdBy: string = '';
  description: string = '';

  constructor(obj?: any) {
    this.channelID = obj ? obj.channelID : '';
    this.channelName = obj ? obj.channelName : '';
    this.channelMember = obj ? obj.channelMember : [];
    this.createdBy = obj ? obj.createdBy : '';
    this.description = obj ? obj.description : '';
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
