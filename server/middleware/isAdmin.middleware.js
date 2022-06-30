
const UserService = require("../services/user.service");
module.exports=async(request,response,next)=>{
    const {userId}=request.session;
    if(!userId) {
        request.flash("error","Kindly login to continue");
        return response.redirect("/user/login");
    }
    const foundUser=await UserService.fetchUsersByParam({key:"id",value:userId});
    if(foundUser.length>0){
        foundUser[0].password =undefined;
        request.user=foundUser[0];
        if(!foundUser[0].isAdmin){
            request.flash("error","You are not allowed to access this page");
            return response.redirect("/");
        }
    }
    next();    
}