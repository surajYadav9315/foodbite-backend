import Express from 'express'

const app = Express()

app.get("/test", (req, res, next) => {
    print("testing...");
})

app.listen(3000, () => {
    console.log("server is running at post 3000");
})