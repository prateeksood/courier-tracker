
const router = require("express").Router();
const customAsync = require("../helpers/customAsync");

router.get("/",(request, response)=> {
    response.redirect("/admin/couriers");
})
router.get("/users", (request, response)=> {
    response.render("pages/admin-users",{
        activeTab: "users",
        user:request.user
    });
});
router.get("/couriers", (request, response)=> {
    response.render("pages/admin-couriers",{
        activeTab:"couriers",
        user:request.user
    });
});
router.get("/database", (request, response)=> {
    response.render("pages/admin-db",{
        activeTab:"database",
        user:request.user
    });
});

module.exports = router;