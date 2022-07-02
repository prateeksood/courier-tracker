const ExpressError = require("../helpers/ExpressError");
const OrderService = require("../services/order.service");
const UserService = require("../services/user.service");
const { update } = require("./user.controller");
const cities= require("../helpers/cities");
const sanitize = require("../helpers/sanitize");
const commonValidation = require("../validation/common.validation");
const orderValidation = require("../validation/order.validation");
module.exports = class orderController {
  static async fetch(request, response, next) {
    const foundOrders = await OrderService.fetchAllOrders();
    if (!foundOrders)
      response.status(400).json({ message: "No orders found" });
    else
      response.status(200).json({ orders: foundOrders });

  }
  static async fetchById(request, response, next) {
    if(!commonValidation.numeric.test(request.params.id )){
      request.flash("error", "id can only be numeric");
      return response.redirect("/");
    }
    const foundOrder = await OrderService.fetchOrdersByParam({ key: "id", value:sanitize(request.params.id) });
    const orderLocations = await OrderService.fetchOrderLocationsByParam({ key: "orderId", value: sanitize(request.params.id) });
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
    if (foundOrder.length<=0){
      request.flash("error", "No orders found with the specified id");
      return response.redirect("/");
    }
    response.render("pages/single-courier",{
      type:request.query.from,
      order:foundOrder[0],
      orderLocations,
      user:request.user,
      cities
    })

  }
  static async searchOrder(request, response, next) {
    
    if(!request.body.search||request.body.search===""){
      request.flash("error",`Kindly enter a valid search input`);
      return response.redirect("/admin/couriers");
    }
    if(!commonValidation.alphaNumericplusSymbols.test(request.body.search )){
      request.flash("error","Input can only contain letters, numbers and special character (@ ,$ ,! ,%, & ,* ,# ,? ,. ,_ )");
      return response.redirect("/admin/couriers");
    }
    const conditions=[
      { key: "id", value: sanitize(request.body.search) },
      { key: "senderEmail", value:sanitize(request.body.search)  },
      { key: "senderContactNumber", value: sanitize(request.body.search)  },
      { key: "receiverEmail", value: sanitize(request.body.search)  },
      { key: "receiverContactNumber", value:sanitize(request.body.search)  },
    ]
    const foundOrders = await OrderService.fetchOrdersByParams(conditions);
    if (foundOrders.length<=0){
      request.flash("error",`No orders matching your search input found`);
      return response.redirect("/admin/couriers");
    }
    else{
      response.render("pages/admin-couriers",{
          query:request.body.search,
          from:request.body.from,
          activeTab:"couriers",
          user:request.user,
          orders:foundOrders
      });
    }
  }
  static async searchOrderWithTrackingId(request, response, next) {
    if(!request.body.search||request.body.search===""){
      request.flash("error",`Kindly enter a valid tracking Id`);
      return response.redirect("/");
    }
    if(!commonValidation.numeric.test(request.body.search )){
      request.flash("error","Tracking Id can only be numeric");
      return response.redirect("/");
    }
    const foundOrder = await OrderService.fetchOrdersByParam({ key: "id", value:sanitize( request.body.search )});
    if (foundOrder.length<=0){
      request.flash("error",`Invalid tracking Id`);
      return response.redirect("/");
    }
    const orderLocations = await OrderService.fetchOrderLocationsByParam({ key: "orderId", value:sanitize( request.body.search )});
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
    
    response.render("pages/search-results",{
      order:foundOrder[0],
      orderLocations,
      user:request.user,
      cities
    })
  }
  static async create(request, response, next) {
    let data = request.body;
    data.senderId=sanitize(request.user.id);
    data.senderEmail=sanitize(request.user.email);
    data.senderContactNumber=sanitize(request.user.contactNumber);
    const {name,origin,destination,senderEmail,receiverEmail,senderContactNumber,receiverContactNumber}=data;
    let message;
    if(!orderValidation.name.test(name)){
      message="Name can only contain letters, numbers and special characters, and must be 4-50 characters long";
    }
    else if(!orderValidation.email.test(senderEmail)||!orderValidation.email.test(receiverEmail)){
      message="Inavlid email format"
    }
    else if(!orderValidation.contactNumber.test(senderContactNumber)||!orderValidation.contactNumber.test(receiverContactNumber)){
      message="Inavlid contact number format";
    }
    else if(!commonValidation.alphaNumericplusSymbols.test(origin)){
      console.log(origin);
      message="Inavlid origin city format";
    }
    else if(!commonValidation.alphaNumericplusSymbols.test(destination)){
      message="Inavlid destination city format";
    }
    if (message){
      request.flash("error",message);
      response.redirect("/user/couriers/new");
      return;
    }
    const receiver=await UserService.fetchUsersByParam({key:"email",value:sanitize(data.receiverEmail)});
    if(receiver.length>0){
      data.receiverId=receiver[0].id;
    }
    const createdOrder = await OrderService.createOrder(data);
    data={};
    data.id =createdOrder[0].id;
    data.previousLocation="User";
    data.currentLocation=createdOrder[0].origin;
    await OrderService.updateLocation(data);
    if (!createdOrder){
      request.flash("error",`Unable to create order.`);
      response.redirect("/user/couriers/new");
    }
    else{
      request.flash("success",`Order Successfully created`);
      response.redirect("/user/couriers/")
    }
  }
  static async fetchLocationsById(request, response, next) {
    const condition = { key: "orderId", value: sanitize(request.params.id) };
    const foundLocations = await OrderService.fetchOrderLocationsByParam(condition);
    if (foundLocations.length<=0)
      response.status(400).json({ message: "No orders found" });
    else
      response.status(200).json({ orders: foundLocations });

  }
  static async updateLocation(request, response, next) {
    if(!commonValidation.numeric.test(request.params.id )){
      request.flash("error","id can only be numeric");
      return response.redirect(`/`);
    }
    if(!request.body.location ||!commonValidation.alphaNumericplusSymbols.test(request.body.location )){
      request.flash("error","Invalid city name");
      return response.redirect(`/order/${request.params.id}`);
    }
    const orderId=sanitize(request.params.id);
    let updatedOrder;
    const order=await OrderService.fetchOrdersByParam({key:"id",value:orderId});
    if(order.length>0){
      const delivered=request.body.markDelivered?1:0;
      let data={};
      data.id = order[0].id;
      data.previousLocation=order[0].currentLocation;
      data.currentLocation=sanitize(request.body.location);
      await OrderService.updateLocation(data);
      updatedOrder =await OrderService.updateOrder(
        {
          currentLocation:sanitize(request.body.location),
          isDelivered:delivered
        },
        {
          key:"id",value:order[0].id
        }
      );
    }else{
      throw new ExpressError("Inavlid Id",400);
    }
    request.flash("success",`Order Successfully Updated`);
    response.redirect(`/order/${order[0].id}`);
  }

  static async update(request, response, next) {
    const data = request.body;
    const condition = { key: "id", value:sanitize( request.params.id )};
    const updatedOrder = await OrderService.updateOrder(data, condition);
    if (updatedOrder.length <= 0)
      response.status(400).json({ message: "Unable to update order." });
    else
      response.status(200).json({ orders: updatedOrder });

  }

  static async delete(request, response, next) {
    const condition = { key: "id", value:sanitize( request.params.id )};
    const deletedOrder = await OrderService.deleteOrder(condition);
    if (deletedOrder.affectedRows === 0)
      response.status(400).json({ message: "Unable to delete order." });
    else
      response.status(200).json({ orders: deletedOrder });
  }
}