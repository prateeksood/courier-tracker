
const router = require("express").Router();
const OrderController = require("../controllers/order.controller");
const customAsync = require("../helpers/customAsync");

router.get("/",customAsync(OrderController.fetch));
router.post("/create",customAsync(OrderController.create));
router.post("/update/:id",customAsync(OrderController.update));
router.get("/delete/:id",customAsync(OrderController.delete));
router.get("/:id",customAsync(OrderController.fetchById));

module.exports = router;