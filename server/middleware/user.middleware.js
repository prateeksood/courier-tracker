
const UserService = require("../services/user.service");
module.exports=async(request,response,next)=>{
    const {userId}=request.session;
    if(!userId) {
        request.user=null;
    }
    else{

        const foundUser=await UserService.fetchUsersByParam({key:"id",value:userId});
        if(foundUser.length>0){
            foundUser[0].password =undefined;
            request.user=foundUser[0];
        }
        else{
            request.user=null;
        }
    }
    next();    
}