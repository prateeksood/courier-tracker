const db=require('../helpers/db');
module.exports = class OrderService {

    static fetchAllOrders=async ()=>{
        let query=`SELECT * FROM courier_tracker.orders`;
        try{
            let foundOrders=await db.query(query);
            return foundOrders;
        }catch(err){
            throw Error(`Error while finding Orders : ${err.message}`);
        }
    }
    static fetchOrdersByParam=async (condition)=>{
        let query=`SELECT * FROM courier_tracker.orders where ${condition.key} in ("${condition.value}")`;
        try{
            let foundOrders=await db.query(query);
            return foundOrders;
        }catch(err){
            throw Error(`Error while finding Orders : ${err.message}`);
        }
    }
    static fetchOrdersByParams=async (conditions)=>{
        let query=`SELECT * FROM courier_tracker.orders where ${conditions[0].key} in ("${conditions[0].value}") `;
        conditions.forEach((condition,i )=> {
            if(i>=1)
                query+=`OR ${condition.key} in ("${condition.value}") `;
        });
        try{
            let foundOrders=await db.query(query);
            return foundOrders;
        }catch(err){
            throw Error(`Error while finding Orders : ${err.message}`);
        }
    }
    static fetchOrderLocationsByParam=async (condition)=>{
        let query=`SELECT * FROM courier_tracker.order_movement where ${condition.key} in ("${condition.value}") ORDER BY time`;
        try{
            let foundLocations=await db.query(query);
            return foundLocations;
        }catch(err){
            throw Error(`Error while finding Orders : ${err.message}`);
        }
    }
    static createOrder=async (order)=>{
        let query=`
                INSERT INTO courier_tracker.orders
                 (
                    name,
                    origin,
                    destination,
                    senderId,
                    ${order.receiverId?"receiverId,":""}
                    receiverAddress,
                    receiverEmail,
                    receiverContactNumber,
                    senderAddress,
                    senderContactNumber,
                    senderEmail,
                    currentLocation
                ) 
                VALUES (
                    "${order.name}",
                    "${order.origin}",
                    "${order.destination}",
                    "${order.senderId}",
                    ${order.receiverId?"\""+order.receiverId+"\",":""}
                    "${order.receiverAddress}",
                    "${order.receiverEmail}",
                    "${order.receiverContactNumber}",
                    "${order.senderAddress}",
                    "${order.senderContactNumber}",
                    "${order.senderEmail}",
                    "${order.origin}"
                )`;
        try{
            const result=await db.query(query);
            query =`SELECT * FROM courier_tracker.orders WHERE id=${result.insertId}`
            let createdOrder=await db.query(query);
            return createdOrder;
        }catch(err){
            throw Error(`Error while creating  Order : ${err.message}`);
        }
    }
    static updateLocation=async (order)=>{
        let query=`
                INSERT INTO courier_tracker.order_movement
                 (
                    previousLocation,
                    currentLocation,
                    orderId
                ) 
                VALUES (
                    "${order.previousLocation}",
                    "${order.currentLocation}",
                    "${order.id}"
                )`;
        try{
            const result=await db.query(query);
            query =`SELECT * FROM courier_tracker.orders WHERE id= ${result.insertId}`
            let createdOrder=await db.query(query);
            return createdOrder;
        }catch(err){
            throw Error(`Error while creating  Order : ${err.message}`);
        }
    }
    static updateOrder=async (order,condition)=>{
        let query=`UPDATE courier_tracker.orders SET `;
        for(let key in order){
            query+=` ${key}="${order[key]}",`;
        }
        query=query.slice(0,-1);
        query+=` WHERE ${condition.key}=${condition.value}`
        try{
            await db.query(query);
            query =`SELECT * FROM courier_tracker.orders WHERE ${condition.key}=${condition.value}`
            let updatedOrder=await db.query(query);
            return updatedOrder;
        }catch(err){
            throw Error(`Error while updating Order : ${err.message}`);
        }
    }

    static deleteOrder=async (condition)=>{
        let query=`DELETE FROM courier_tracker.orders WHERE ${condition.key}=${condition.value}`;
        try{
            let deletedOrder=await db.query(query);
            return deletedOrder;
        }catch(err){
            throw Error(`Error while deleting Order : ${err.message}`);
        }
    }
}