const ExpressError = require("../helpers/ExpressError");
const OrderService = require("../services/order.service");
const UserService = require("../services/user.service");
const { update } = require("./user.controller");
module.exports = class orderController {
  static async fetch(request, response, next) {
    const foundOrders = await OrderService.fetchAllOrders();
    if (!foundOrders)
      response.status(400).json({ message: "No orders found" });
    else
      response.status(200).json({ orders: foundOrders });

  }
  static async fetchById(request, response, next) {
    const foundOrder = await OrderService.fetchOrdersByParam({ key: "id", value: request.params.id });
    const orderLocations = await OrderService.fetchOrderLocationsByParam({ key: "orderId", value: request.params.id });
    const months=["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    orderLocations.forEach(orderLocation=>{
      orderLocation.dateString=`At 
                  ${String(new Date(Date.parse(orderLocation.time)).getHours()).padStart(2, '0')}:
                  ${String(new Date(Date.parse(orderLocation.time)).getMinutes()).padStart(2, '0')} 
                On 
                  ${String(new Date(Date.parse(orderLocation.time)).getDate()).padStart(2, '0')} 
                  ${months[(new Date(Date.parse(orderLocation.time)).getMonth())]}, 
                  ${String(new Date(Date.parse(orderLocation.time)).getFullYear())}
                `;
    })
    if (foundOrder.length<=0)
      throw new ExpressError("No orders found",400);
    response.render("pages/admin-single-courier",{
      order:foundOrder,
      orderLocations
    })

  }
  static async searchOrder(request, response, next) {
    const conditions=[
      { key: "id", value: request.query.searchKey },
      { key: "senderEmail", value: request.query.searchKey },
      { key: "senderContactNumber", value: request.query.searchKey },
      { key: "receiverEmail", value: request.query.searchKey },
      { key: "receiverContactNumber", value: request.query.searchKey },
    ]
    const foundOrders = await OrderService.fetchOrdersByParams(conditions);
    if (foundOrders.length<=0)
      response.status(400).json({ message: "No orders found" });
    else
      response.status(200).json({ orders: foundOrders });
  }
  static async create(request, response, next) {
    let data = request.body;
    data.senderId=request.user.id;
    data.senderEmail=request.user.email;
    data.senderContactNumber=request.user.contactNumber;
    const receiver=await UserService.fetchUsersByParam({key:"email",value:data.receiverEmail});
    if(receiver.length>0){
      data.receiverId=receiver[0].id;
    }
    const createdOrder = await OrderService.createOrder(data);
    data={};
    data.id =createdOrder[0].id;
    data.previousLocation="User";
    data.currentLocation=createdOrder[0].origin;
    await OrderService.updateLocation(data);
    if (!createdOrder)
      response.status(400).json({ message: "Unable to create order." });
    else
      response.status(200).json({ orders: createdOrder });
  }
  static async fetchLocationsById(request, response, next) {
    const condition = { key: "orderId", value: request.params.id };
    const foundLocations = await OrderService.fetchOrderLocationsByParam(condition);
    if (foundLocations.length<=0)
      response.status(400).json({ message: "No orders found" });
    else
      response.status(200).json({ orders: foundLocations });

  }
  static async updateLocation(request, response, next) {
    const orderId=request.params.id;
    let updatedOrder;
    const order=await OrderService.fetchOrdersByParam({key:"id",value:orderId});
    if(order.length>0){
      let data={};
      data.id = order[0].id;
      data.previousLocation=order[0].currentLocation;
      data.currentLocation=request.body.location;
      await OrderService.updateLocation(data);
      updatedOrder =await OrderService.updateOrder({currentLocation:request.body.location},{key:"id",value:order[0].id});
    }else{
      throw new ExpressError("Inavlid Id",400);
    }
    if (!updatedOrder)
      response.status(400).json({ message: "Unable to update location." });
    else
      response.status(200).json({ orders: updatedOrder });
  }

  static async update(request, response, next) {
    const data = request.body;
    const condition = { key: "id", value: request.params.id };
    const updatedOrder = await OrderService.updateOrder(data, condition);
    if (updatedOrder.length <= 0)
      response.status(400).json({ message: "Unable to update order." });
    else
      response.status(200).json({ orders: updatedOrder });

  }

  static async delete(request, response, next) {
    const condition = { key: "id", value: request.params.id };
    const deletedOrder = await OrderService.deleteOrder(condition);
    if (deletedOrder.affectedRows === 0)
      response.status(400).json({ message: "Unable to delete order." });
    else
      response.status(200).json({ orders: deletedOrder });
  }
}