const OrderService = require("../services/order.service")
module.exports = class orderController {
  static async fetch(request, response,next) {
      const foundOrders = await OrderService.fetchAllOrders();
      if (!foundOrders)
        response.status(400).json({ message: "No orders found" });
      else
        response.status(200).json({ orders: foundOrders });
    
  }
  static async fetchById(request, response,next) {
      const condition={key:"id", value:request.params.id};
      const foundOrder = await OrderService.fetchOrdersByParam(condition);
      if (!foundOrder)
        response.status(400).json({ message: "No orders found" });
      else
        response.status(200).json({ orders: foundOrder });
    
  }
  static async create(request, response,next) {
      const data = request.body;
      const createdOrder = await OrderService.createOrder(data);
      if (!createdOrder)
        response.status(400).json({ message: "Unable to create order." });
      else
        response.status(200).json({ orders: createdOrder });
  }

  static async update(request, response,next) {
      const data = request.body;
      const condition = {key:"id",value:request.params.id};
      const updatedOrder = await OrderService.updateOrder(data,condition);
      if (updatedOrder.length<=0)
        response.status(400).json({ message: "Unable to update order." });
      else
        response.status(200).json({ orders: updatedOrder });
    
  }

  static async delete(request, response,next) {
      const condition = {key:"id",value:request.params.id};
      const deletedOrder = await OrderService.deleteOrder(condition);
      if (deletedOrder.affectedRows===0)
        response.status(400).json({ message: "Unable to delete order." });
      else
        response.status(200).json({ orders: deletedOrder });
  }
}