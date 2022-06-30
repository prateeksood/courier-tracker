
const router = require("express").Router();
const UserController = require("../controllers/user.controller");
const OrderService = require("../services/order.service");
const customAsync = require("../helpers/customAsync");
const authMiddleware = require("../middleware/auth.middleware");
const cities= require("../helpers/cities");
const isAdminMiddleware = require("../middleware/isAdmin.middleware");
router.get("/register", (request, response,next)=> {
    request.session.userId = null;
    response.render("pages/register");
});
router.get("/login", (request, response,next)=> {
    request.session.userId = null;
    response.render("pages/login");
});
router.get("/", authMiddleware,(request, response,next)=> {  
    response.render("pages/user-profile",{
        user:request.user
    });
})
router.get("/couriers", authMiddleware,async(request, response,next)=> {  
    let conditions=[
        { key: "senderId", value: request.user.id }
      ]
    const fromTheUserOrders = await OrderService.fetchOrdersByParams(conditions);
    conditions=[
        { key: "receiverId", value: request.user.id }
      ]
    const toTheUserOrders = await OrderService.fetchOrdersByParams(conditions);
    response.render("pages/user-couriers",{
        user:request.user,
        fromTheUserOrders,
        toTheUserOrders
    });
})
router.get("/couriers/new", authMiddleware,(request, response,next)=> {  
    response.render("pages/user-new-courier",{
        user:request.user,
        cities
    });
})
router.post("/register",customAsync(UserController.registerUser));
router.post("/search",isAdminMiddleware,customAsync(UserController.searchUser));
router.post("/login",customAsync(UserController.loginUser));
router.get("/logout",customAsync(UserController.logoutUser));
router.post("/update/:id",isAdminMiddleware,customAsync(UserController.update));
router.get("/toggleAdmin/:id",isAdminMiddleware,customAsync(UserController.toggleAdminStatus));
router.get("/delete/:id",isAdminMiddleware,customAsync(UserController.delete));
// router.get("/:id",customAsync(UserController.fetchById));
module.exports = router;