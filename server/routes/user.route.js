
const router = require("express").Router();
const UserController = require("../controllers/user.controller");
const customAsync = require("../helpers/customAsync");
const authMiddleware = require("../middleware/auth.middleware");

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
router.get("/couriers", authMiddleware,(request, response,next)=> {  
    response.render("pages/user-couriers",{
        user:request.user
    });
})
router.post("/register",customAsync(UserController.registerUser));
router.post("/login",customAsync(UserController.loginUser));
router.get("/logout",customAsync(UserController.logoutUser));
router.post("/update/:id",customAsync(UserController.update));
router.get("/delete/:id",customAsync(UserController.delete));
// router.get("/:id",customAsync(UserController.fetchById));
module.exports = router;