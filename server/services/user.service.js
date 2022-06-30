const db=require('../helpers/db');
module.exports = class UserService {

    static fetchAllUsers=async ()=>{
        let query=`SELECT * FROM courier_tracker.users`;
        try{
            let foundUsers=await db.query(query);
            return foundUsers;
        }catch(err){
            throw Error(`Error while finding Users : ${err.message}`);
        }
    }
    static fetchUsersByParam=async (condition)=>{
        let query=`SELECT * FROM courier_tracker.users where ${condition.key} in ("${condition.value}")`;
        try{
            let foundUsers=await db.query(query);
            return foundUsers;
        }catch(err){
            throw Error(`Error while finding Users : ${err.message}`);
        }
    }
    static fetchUsersByParams=async (conditions)=>{
        let query=`SELECT * FROM courier_tracker.users where ${conditions[0].key} in ("${conditions[0].value}") `;
        conditions.forEach((condition,i )=> {
            if(i>=1)
                query+=`OR ${condition.key} in ("${condition.value}") `;
        });
        try{
            let foundUsers=await db.query(query);
            return foundUsers;
        }catch(err){
            throw Error(`Error while finding users : ${err.message}`);
        }
    }
    static createUser=async (user)=>{
        let query=`INSERT INTO courier_tracker.users (name,email,password,contactNumber) VALUES ("${user.name}","${user.email}","${user.password}","${user.contactNumber}")`;
        console.log(query);
        try{
            const result=await db.query(query);
            query =`SELECT * FROM courier_tracker.users WHERE id= ${result.insertId}`;
            let createdUser=await db.query(query);
            return createdUser;
        }catch(err){
            throw Error(`Error while creating  User : ${err.message}`);
        }
    }
    static updateUser=async (user,condition)=>{
        let query=`UPDATE courier_tracker.users SET `;
        for(let key in user){
            query+=` ${key}="${user[key]}",`;
        }
        query=query.slice(0,-1);
        query+=` WHERE ${condition.key}=${condition.value}`
        console.log(query);
        try{
            await db.query(query);
            query =`SELECT * FROM courier_tracker.users WHERE ${condition.key}=${condition.value}`
            let updatedUser=await db.query(query);
            return updatedUser;
        }catch(err){
            throw Error(`Error while updating User : ${err.message}`);
        }
    }

    static deleteUser=async (condition)=>{
        let query=`DELETE FROM courier_tracker.users WHERE ${condition.key}=${condition.value}`;
        try{
            let deletedUser=await db.query(query);
            return deletedUser;
        }catch(err){
            throw Error(`Error while deleting User : ${err.message}`);
        }
    }
}