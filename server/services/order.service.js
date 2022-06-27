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
        let query=`SELECT * FROM courier_tracker.orders where ${condition.key} in (${condition.value})`;
        try{
            let foundOrders=await db.query(query);
            return foundOrders;
        }catch(err){
            throw Error(`Error while finding Orders : ${err.message}`);
        }
    }
    static createOrder=async (order)=>{
        let query=`INSERT INTO courier_tracker.orders (name,origin,destination) VALUES ("${order.name}","${order.origin}","${order.destination}")`;
        console.log(query);
        try{
            await db.query(query);
            query =`SELECT * FROM courier_tracker.orders WHERE id= LAST_INSERT_ID()`
            let createdOrder=await db.query(query);
            return createdOrder;
        }catch(err){
            throw Error(`Error while creating  Order : ${err.message}`);
        }
    }
    static updateOrder=async (order,condition)=>{
        let query=`UPDATE courier_tracker.orders SET name="${order.name}",origin="${order.origin}",destination="${order.destination}" WHERE ${condition.key}=${condition.value}`;
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