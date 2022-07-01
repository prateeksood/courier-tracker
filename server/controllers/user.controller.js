const UserService = require("../services/user.service");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const dataValidation = require('../validation/user.validation');
const commonValidation = require("../validation/common.validation");
const sanitize = require("../helpers/sanitize");
module.exports = class userController {
    static async fetch(request, response, next) {
        const foundUsers = await UserService.fetchAllUsers();
        if (!foundUsers)
            response.status(400).json({ message: "No users found" });
        else
            response.status(200).json({ users: foundUsers });
    }
    static async fetchById(request, response, next) {
        const condition = { key: "id", value: sanitize(request.params.id) };
        const foundUser = await UserService.fetchUsersByParam(condition);
        if (!foundUser)
            response.status(400).json({ message: "No users found" });
        else
            response.status(200).json({ users: foundUser });
    }
    static async searchUser(request, response, next) {
        if (!request.body.search || request.body.search === "") {
            request.flash("error", `Kindly enter a valid search input`);
            return response.redirect("/admin/users");
        }
        if (!commonValidation.alphaNumericplusSymbols.test(request.body.search)) {
            request.flash("error", "Input can only contain letters, numbers and special character (@ ,$ ,! ,%, & ,* ,# ,? ,. ,_ )");
            return response.redirect("/admin/users");
        }
        const conditions = [
            { key: "id", value: sanitize(request.body.search) },
            { key: "email", value: sanitize(request.body.search) },
            { key: "ContactNumber", value: sanitize(request.body.search) }
        ]
        const foundUsers = await UserService.fetchUsersByParams(conditions);
        if (foundUsers.length <= 0) {
            request.flash("error", `No users matching your search input found`);
            return response.redirect("/admin/users");
        }
        else {
            response.render("pages/admin-users", {
                activeTab: "users",
                user: request.user,
                allUsers: foundUsers
            });
        }
    }
    static async registerUser(request, response, next) {
        request.session.userId = null;
        const hashRounds = 10;
        let data = {}
        data.name = sanitize(request.body.name);
        data.email = sanitize(request.body.email);
        data.password = sanitize(request.body.password);
        data.confirmPassword = sanitize(request.body.confirmPassword);
        data.contactNumber = sanitize(request.body.contactNumber);
        const { name, email, password, confirmPassword, contactNumber } = data;
        let message = null;

        if (!dataValidation.name.test(name)) {
            message = "Name should only containe letters and spaces";
        }
        else if (!dataValidation.email.test(email)) {
            message = "Invalid email adress format";
        }
        else if (!dataValidation.password.test(password)) {
            message = "Invalid password. Requirements: Minimum 6 characters, maximum 20 characters, at least one letter, one number and one special character (@ ,$ ,! ,% ,* ,# ,?,& ,. ,_ )";
        }
        else if (password !== confirmPassword) {
            message = "Password does not match";
        }
        else if (!dataValidation.contactNumber.test(contactNumber)) {
            message = "Invalid mobile number format";
        }
        const existingUser = await UserService.fetchUsersByParam({ key: "email", value: email });
        if (existingUser.length > 0) {
            message = "Email address already in use! Try again with different email.";
        }

        if (message) {
            response.render("pages/register", {
                formError: message,
                formData: data
            });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, hashRounds);
        data.password = hashedPassword;
        let savedUser = (await UserService.createUser(data))[0];
        savedUser.password = undefined;
        request.session.userId = savedUser.id;
        request.flash("success", `Welcome  ${savedUser.name}`);
        response.redirect("/");
    }

    static async loginUser(request, response, next) {
        request.session.userId = null;
        let data = {};
        data.email = sanitize(request.body.email);
        data.password = sanitize(request.body.password);
        const { email, password } = data;
        let message = null;
        if (!dataValidation.email.test(email)) {
            message = "Invalid email format"
        }
        else if (!commonValidation.alphaNumericplusSymbols.test(password)) {
            message = "Password can only contain letters, numbers and special character (@ ,$ ,! ,%, & ,* ,# ,? ,. ,_ )"
        }
        const foundUsers = await UserService.fetchUsersByParam({ key: "email", value: email });
        if (foundUsers.length <= 0) {
            message = "Email doesn't exist.";
        }
        if (message) {
            response.render("pages/login", {
                formError: message,
                formData: data
            });
            return;
        }
        const foundUser = foundUsers[0];
        const isPasswordMatch = await bcrypt.compare(password, foundUser.password);
        if (!isPasswordMatch) {
            response.render("pages/login", {
                formError: "Invalid Password",
                formData: data
            });
            return;
        }
        foundUser.password = undefined;
        request.session.userId = foundUser.id;
        request.flash("success", `Welcome back ${foundUser.name}`);
        response.redirect("/");
    }
    static async logoutUser(request, response, next) {
        request.session.userId = null;
        request.user = null;
        response.redirect('/user/login');
    }
    static async toggleAdminStatus(request, response, next) {
        if (!commonValidation.numeric.test(request.params.id)) {
            request.flash("error", "id can only be numeric");
            return response.redirect("/admin/users");
        }
        const data = { isAdmin: sanitize(request.query.isAdmin) };
        const condition = { key: "id", value: sanitize(request.params.id) };
        const updatedUser = await UserService.updateUser(data, condition);
        if (updatedUser.length <= 0) {
            request.flash("error", "Unable to complete the request. Please try again later.");
            response.redirect("/admin/users");
        }
        else
            response.redirect("/admin/users");

    }
    static async update(request, response, next) {
        const data = request.body;
        if (!commonValidation.numeric.test(request.params.id)) {
            request.flash("error", "id can only be numeric");
            return response.redirect("/admin/users");
        }
        const condition = { key: "id", value: sanitize(request.params.id) };
        const updatedUser = await UserService.updateUser(data, condition);
        if (updatedUser.length <= 0)
            response.status(400).json({ message: "Unable to update user." });
        else
            response.status(200).json({ users: updatedUser });
    }
    static async delete(request, response, next) {
        if (!commonValidation.numeric.test(request.params.id)) {
            request.flash("error", "id can only be numeric");
            return response.redirect("/admin/users");
        }
        const condition = { key: "id", value: sanitize(request.params.id) };
        const deletedUser = await UserService.deleteUser(condition);
        if (deletedUser.affectedRows === 0)
            response.status(400).json({ message: "Unable to delete user." });
        else
            response.status(200).json({ users: deletedUser });
    }
}