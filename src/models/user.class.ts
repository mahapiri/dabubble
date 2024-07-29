export class User {
    username: string = "";
    userId: string = "";
    email: string = "";
    state: string = "";
    userChannels: string[] = [];
    profileImage: string = ""
    

    constructor(obj?: any) {
        this.username = obj? obj.username : "";
        this.userId = obj? obj.userId :  "";
        this.email = obj? obj.email :  "";
        this.state = obj? obj.state :  "";
        this.userChannels = obj? obj.userChannels :  "";
        this.profileImage = obj? obj.profileImage : "";
    }

}