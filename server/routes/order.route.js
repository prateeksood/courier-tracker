
const router = require("express").Router();
const OrderController = require("../controllers/order.controller");
const customAsync = require("../helpers/customAsync");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/",customAsync(OrderController.fetch));
router.post("/search",customAsync(OrderController.searchOrder));
router.post("/search/id",customAsync(OrderController.searchOrderWithTrackingId));
router.post("/create",authMiddleware,customAsync(OrderController.create));
router.post("/location/update/:id",authMiddleware,customAsync(OrderController.updateLocation));
router.get("/location/:id",customAsync(OrderController.fetchLocationsById));
router.post("/update/:id",authMiddleware,customAsync(OrderController.update));
router.get("/delete/:id",authMiddleware,customAsync(OrderController.delete));
router.get("/:id",customAsync(OrderController.fetchById));

module.exports = router;