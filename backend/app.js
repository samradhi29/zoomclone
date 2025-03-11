// import express from "express";
// import { createServer } from "node:http";
// import { Server } from "socket.io";
// // import mongoose from "mongoose";
// import userRoutes from "./src/routes/usersroute.js"; // Fixed import
// import cors from "cors";

// const app = express();
// const server = createServer(app);
// const io = new Server(server);

// app.set("port", process.env.PORT || 8000);
// app.use(cors());
// app.use(express.json({ limit: "40kb" }));
// app.use(express.urlencoded({ limit: "40kb", extended: true }));

// app.use("/api/v1/users", userRoutes); 

// // mongoose.connect("mongodb+srv://samradhi4320:ArRXHzPMU3cQe6Uj@cluster0.l5rl8.mongodb.net/");

// server.listen(app.get("port"), () => {
//     console.log("Listening on port 8000");
// });


// const express = require("express");
// const http = require("http");
// const cors = require("cors");

// const app = express();
// const server = http.createServer(app);
// const io = require("socket.io")(server, {
//     cors: {
//         origin: "http://localhost:5173",
//         methods: ["GET", "POST"]
//     }
// });

// app.use(cors()); // Enable CORS for all routes

// server.listen(8000, () => {
//     console.log("Server running on port 8000");
// });


// import express from "express";
// import { createServer } from "node:http";

// import { Server } from "socket.io";

// // import mongoose from "mongoose";
// import { connectToSocket } from "./controllers/socketManager.js";

// import cors from "cors";
// import userRoutes from "./routes/users.routes.js";

// const app = express();
// const server = createServer(app);
// const io = connectToSocket(server);


// app.set("port", (process.env.PORT || 8000))
// app.use(cors());
// app.use(express.json({ limit: "40kb" }));
// app.use(express.urlencoded({ limit: "40kb", extended: true }));

// app.use("/api/v1/users", userRoutes);

// const start = async () => {
//     // app.set("mongo_user")
//     // const connectionDb = await mongoose.connect("mongodb+srv://imdigitalashish:imdigitalashish@cluster0.cujabk4.mongodb.net/")

//     // console.log(`MONGO Connected DB HOst: ${connectionDb.connection.host}`)
//     server.listen(app.get("port"), () => {
//         console.log("LISTENIN ON PORT 8000")
//     });



// }



// start();

import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./src/controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./src/routes/usersroute.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

const start = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://samradhi4320:samradhi123@cluster0.7eqhy.mongodb.net/"
        );
        console.log("Connected to MongoDB");

        server.listen(app.get("port"), () => {
            console.log(`Listening on port ${app.get("port")}`);
        });
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};

start();
