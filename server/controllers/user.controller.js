const UserService = require("../services/user.service");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const dataValidation = require('../validation/user.validation');
module.exports = class userController {
    static async fetch(request, response,next) {
            const foundUsers = await UserService.fetchAllUsers();
            if (!foundUsers)
                response.status(400).json({ message: "No users found" });
            else
                response.status(200).json({ users: foundUsers });
    }
    static async fetchById(request, response,next) {
            const condition = { key: "id", value: request.params.id };
            const foundUser = await UserService.fetchUsersByParam(condition);
            if (!foundUser)
                response.status(400).json({ message: "No users found" });
            else
                response.status(200).json({ users: foundUser });
    }
    static async registerUser(request, response,next) {
            request.session.userId = null;
            const hashRounds = 10;
            let data = request.body;
            const { email, password,confirmPassword } = data;
            const existingUser = await UserService.fetchUsersByParam({ key: "email", value: email });
            let message = null;
            if (existingUser.length > 0) {
                message = "Email address already in use! Try again with different email.";
            } else if (!dataValidation.email.test(email)) {
                message = "Invalid email adress format";
            } else if (!dataValidation.password.test(password)) {
                message = "Invalid password. Requirements: Minimum 6 characters, maximum 50 characters, at least one letter, one number and one special character";
            } else if (password !== confirmPassword) {
                message = "Password does not match";
            }
            if (message) {
                response.render("pages/register", {
                    formError:message,
                    formData:data
                });
                return;
            }
            const hashedPassword = await bcrypt.hash(password, hashRounds);
            data.password = hashedPassword;
            let savedUser = (await UserService.createUser(data))[0];
            savedUser.password = undefined;
            request.session.userId=savedUser.id;
            request.flash("success",`Welcome  ${savedUser.name}`);
            response.redirect("/");  
        }

    static async loginUser(request, response,next) {
            request.session.userId = null;
            let data = request.body;
            const { email, password } = data;
            const foundUsers = await UserService.fetchUsersByParam({ key: "email", value: email });
            if (foundUsers.length<=0) {
                response.render("pages/login", {
                    formError:"Email doesn't exist.",
                    formData:data
                });
                return;
            }
            const foundUser=foundUsers[0];
            const isPasswordMatch = await bcrypt.compare(password, foundUser.password);
            if (!isPasswordMatch){
                response.render("pages/login", {
                    formError:"Invalid Password",
                    formData:data
                });
                return;
            }
            foundUser.password=undefined;
            request.session.userId=foundUser.id;
            request.flash("success",`Welcome back ${foundUser.name}`);
            response.redirect("/");      
    }
    static async logoutUser(request, response,next) {
        request.session.userId = null;
        request.user=null;
        response.redirect('/user/login');
    }
    static async update(request, response,next) {
            const data = request.body;
            const condition = { key: "id", value: request.params.id };
            const updatedUser = await UserService.updateUser(data, condition);
            if (updatedUser.length <= 0)
                response.status(400).json({ message: "Unable to update user." });
            else
                response.status(200).json({ users: updatedUser });
    }
    static async delete(request, response,next) {
            const condition = { key: "id", value: request.params.id };
            const deletedUser = await UserService.deleteUser(condition);
            if (deletedUser.affectedRows === 0)
                response.status(400).json({ message: "Unable to delete user." });
            else
                response.status(200).json({ users: deletedUser });
    }
}