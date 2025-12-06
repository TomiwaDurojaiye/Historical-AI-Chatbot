import {Router} from "express";

const router = Router();

//GET api chat

router.get("/", (req, res) => {
    res.json ({message: "Chat is working"});
});

router.post("/message", (req,res)=> {
    const {message} = req.body;
 if(!message) {
    return res.status(400).json ({error: "Message is required"})
 }
    res.json({
        received: message,
        reply: `You said: ${message}`
    })
});

// export the router to the server
export default router;