const mysql = require('mysql2');
const { password } = require('../validation/user.validation');

require("dotenv").config();

class Database {
    constructor(config) {
        let clusterConfig = {
            // defaultSelector: 'ORDER',
            defaultSelector: 'RR',
            removeNodeErrorCount:2
        };
        this.poolCluster = mysql.createPoolCluster(clusterConfig );
        config.nodes.forEach(node => {
            this.poolCluster.add(node.name, {
                host: node.host,
                database: config.database,
                user: node.user,
                password: node.password,
                charset: config.charset
            });
        });
        this.poolCluster.on('remove', (nodeId) =>{
            console.log('REMOVED NODE : ' + nodeId); 
            let interval=setInterval(()=>{
                let node={}
                if(nodeId==="node_1"){
                    node=config.nodes[0];
                }
                else if(nodeId==="node_2"){
                    node=config.nodes[1];
                }
                else if(nodeId==="node_3"){
                    node=config.nodes[2];
                }
                else{
                    console.log(`Invalid node id ${nodeId}`);
                    return;
                }
                console.log(`Attempting to add node: ${node.name}`);
                try{

                    this.poolCluster.add(node.name, {
                            host: node.host,
                        database: config.database,
                        user: node.user,
                        password: node.password,
                        charset: config.charset
                    })
                    if(this.poolCluster._nodes[nodeId]){
                        console.log(`Successfully added node ${nodeId}  to poolCluster`);
                        clearInterval(interval);
                    }else{
                        console.log(`Failed to add node ${nodeId} to poolCluster`);
                    }
                }
                catch(err){
                    console.log(err);
                }
            },60000)
        });
    }
    async init() {
        try {

            console.log("Checking and creating tables...");
            let query = "CREATE TABLE IF NOT EXISTS `users` (\
            `id` int NOT NULL AUTO_INCREMENT,\
            `name` varchar(255) DEFAULT NULL,\
            `email` varchar(255) DEFAULT NULL,\
            `password` varchar(255) DEFAULT NULL,\
            `contactNumber` varchar(255) DEFAULT NULL,\
            `isAdmin` tinyint(1) DEFAULT '0',\
            PRIMARY KEY (`id`),\
            UNIQUE KEY `id_UNIQUE` (`id`)\
          ) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";
            await db.query(query);
            query = "CREATE TABLE IF NOT EXISTS `orders` (\
            `id` int NOT NULL AUTO_INCREMENT,\
            `name` varchar(255) DEFAULT NULL,\
            `origin` varchar(255) DEFAULT NULL,\
            `destination` varchar(255) DEFAULT NULL,\
            `senderId` int NOT NULL,\
            `receiverId` int DEFAULT NULL,\
            `receiverAddress` varchar(255) DEFAULT NULL,\
            `senderAddress` varchar(255) DEFAULT NULL,\
            `senderEmail` varchar(255) DEFAULT NULL,\
            `senderContactNumber` varchar(255) DEFAULT NULL,\
            `receiverContactNumber` varchar(255) DEFAULT NULL,\
            `receiverEmail` varchar(255) DEFAULT NULL,\
            `isDelivered` tinyint(1) DEFAULT '0',\
            `currentLocation` varchar(255) DEFAULT NULL,\
            PRIMARY KEY (`id`),\
            KEY `FK_PersonOrder` (`senderId`),\
            KEY `FK_users_orders` (`receiverId`),\
            CONSTRAINT `FK_PersonOrder` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`),\
            CONSTRAINT `FK_users_orders` FOREIGN KEY (`receiverId`) REFERENCES `users` (`id`)\
            ) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";
            await db.query(query);
            query = "CREATE TABLE IF NOT EXISTS `order_movement` (\
                `id` int NOT NULL AUTO_INCREMENT,\
                `previousLocation` varchar(255) DEFAULT NULL,\
                `currentLocation` varchar(255) DEFAULT NULL,\
                `orderId` int NOT NULL,\
            `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\
            PRIMARY KEY (`id`),\
            KEY `FK_order_order_movement` (`orderId`),\
            CONSTRAINT `FK_order_order_movement` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`)\
          ) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";
            await db.query(query);
            console.log("Done Checking and creating tables !");
        }
        catch (err) {
            console.log("Error creating tables: " + err);
        }
    }
    clusterStatus(){
        return this.poolCluster._nodes;
    }
    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.poolCluster.getConnection((err, connection)=>{ 
                if (err) {
                    return reject(`connection error:${err}`);
                } else {
                    try{
                        connection.query(sql, args,function(err, rows) {
                            if (err) {
                                throw err;
                            }
                            resolve(rows);
                        });
                    }
                    catch (err) {
                        reject(err);
                    }
                    finally {
                        connection.release();
                    }
                    
                }
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.poolCluster.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }

}


let db = new Database({
    nodes: [
        {
            name: "node_1",
            host: process.env.DB1_HOST,
            user: process.env.DB1_USER,
            password: process.env.DB1_PASS,
        },
        {
            name: "node_2",
            host: process.env.DB2_HOST,
            user: process.env.DB2_USER,
            password: process.env.DB2_PASS,
        },
        {
            name: "node_3",
            host: process.env.DB3_HOST,
            user: process.env.DB3_USER,
            password: process.env.DB3_PASS,
        }
    ],
    database: 'courier_tracker',
    charset: 'utf8mb4'
});

module.exports = db;