require("dotenv").config({path:".env"})
const express = require("express")
const cors = require("cors")
const cookieParser = require('cookie-parser')
const {Server} = require("socket.io")
const { createServer } = require("http");

const sequelize = require("./database")
const router = require("./routers/userRouter")
const {errMiddleware} = require("./middleware/errorHandler")

const app = express()
const port = process.env.port || 5000

const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use("/api", router)
app.use(errMiddleware)

io.on("connection", (socket) => {
    socket.on("send notification", ({ settings }) => {
        const message = `U updated your data. Phone:${settings.phone}, first_name:${settings.first_name}, last_name:${settings.last_name}`
        io.to(socket.id).emit("get notisication",{
            phone:settings.phone,
            first_name:settings.first_name,
            last_name:settings.last_name,
            message:message
        })
    });
});

const start = async() =>{
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        httpServer.listen(port, ()=>{console.log(`Server running on port ${port}`)});
        // app.listen(port, ()=>{console.log(`Server running on port ${port}`)})
    } catch (error) {
        console.log(error)
    }
}
start()