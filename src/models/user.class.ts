export class User {
    username: string = "";
    userID: string = "";
    email: string = "";
    state: string = "";
    userChannels: string[] = [];
    profileImage: string = ""
    

    constructor(obj?: any) {
        this.username = "";
        this.userID = "";
        this.email = "";
        this.state = "";
        this.userChannels = [];
        this.profileImage = "";
    }

}