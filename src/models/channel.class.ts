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
    this.reaction = obj ? obj.reaction : [];
    this.file = obj ? obj.file : '';
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
