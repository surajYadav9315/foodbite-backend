import Express from 'express'

const app = Express()

app.get("/test", (req, res, next) => {
    console.log("testing...");
    return res.status(200).json({
        "status": "success",
        "message": "its working"
    })
})

app.listen(3000, () => {
    console.log("server is running at post 3000");
})