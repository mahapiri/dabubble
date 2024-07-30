export class Channel {
  channelID?: string = '';
  channelName: string = '';
  channelMember: {}[] = [];
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
