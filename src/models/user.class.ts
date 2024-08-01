export class User {
  username: string = '';
  userId: string = '';
  email: string = '';
  state: string = '';
  userChannels: string[] = [];
  profileImage: string = '';

  chosenToChannel: boolean = false;

  constructor(obj?: any) {
    this.username = obj ? obj.username : '';
    this.userId = obj ? obj.userId : '';
    this.email = obj ? obj.email : '';
    this.state = obj ? obj.state : '';
    this.userChannels = obj ? obj.userChannels : '';
    this.profileImage = obj ? obj.profileImage : '';
  }

  getUserJson() {
    return {
      username: this.username,
      userId: this.userId,
      email: this.email,
      state: this.state,
      userChannels: this.userChannels,
      profileImage: this.profileImage,
    };
  }

  static convertUsersToJson(users: User[]): {}[] {
    return users.map((user) => user.getUserJson());
  }
}
