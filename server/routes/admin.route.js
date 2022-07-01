
const router = require("express").Router();
const customAsync = require("../helpers/customAsync");
const OrderService = require("../services/order.service");
const UserService = require("../services/user.service");
const db = require("../helpers/db");
router.get("/", (request, response) => {
    response.redirect("/admin/couriers");
})
router.get("/users", async (request, response, next) => {
    const foundUsers = await UserService.fetchAllUsers();
    response.render("pages/admin-users", {
        activeTab: "users",
        user: request.user,
        allUsers: foundUsers
    });
});
router.get("/couriers", async (request, response, next) => {
    const allCouriers = await OrderService.fetchAllOrders();
    response.render("pages/admin-couriers", {
        activeTab: "couriers",
        user: request.user,
        orders: allCouriers
    });
});
router.get("/database", (request, response, next) => {
    const cluster = db.clusterStatus()
    response.render("pages/admin-db", {
        activeTab: "database",
        user: request.user,
        cluster
    });
});

module.exports = router;