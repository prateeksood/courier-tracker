require("dotenv").config();
const express = require("express");
const OrderRoute = require("./routes/order.route");
const UserRoute = require("./routes/user.route");
const AdminRoute = require("./routes/admin.route");
const ExpressError = require("./helpers/ExpressError");
const authMiddleware = require("./middleware/auth.middleware");
const userMiddleware = require("./middleware/user.middleware");
const session= require("express-session");
const flash=require("connect-flash");
const flashMiddleware = require("./middleware/flash.middleware");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));
app.set("view engine", "ejs");
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(flash());
app.use(flashMiddleware)
app.use(userMiddleware);
app.get("/", function (request, response, next) {
  response.render("index",{
      activeTab:"database",
      user:request.user
  });
});

app.use("/admin",authMiddleware,AdminRoute);
app.use("/user",UserRoute);
app.use("/order",OrderRoute);

app.all("*",(request,response,next)=>{
  next(new ExpressError("Not Found",404));
})
app.use((error,request,response,next)=>{
  !error.statusCode&&(error.statusCode = 500);
  !error.message&&(error.message="Something went Wrong! ");
  response.status(error.statusCode).send(error.stack);
})
const server = app.listen(PORT, function () {
  console.log("Listening on Port: " + PORT);
});