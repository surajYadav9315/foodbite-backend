import app from "./app.js";

app.get("/test", (req, res, next) => {
    console.log("testing...");
    return res.status(200).json({
        "status": "success",
        "message": "its working"
    })
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server is running at post ${PORT}`);
})