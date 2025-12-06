import express from "express";
import cors from "cors";
import chatRouter from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT || 5000; 



app.use(cors());
app.use(express.json());

// Testing server health  
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Backend is working smooth"

    });
});

app.use("/api/chat", chatRouter)

app.listen(PORT , () => {
    console.log(`Server is listening at http://localhost:${PORT}`); 
});
