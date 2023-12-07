const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
    cors: {
      origin: "https://laughing-train-p5wx56rqgjq3rpx7-5504.app.github.dev",
      methods: ["GET", "POST"]
    }
  });

io.on('connection', (client) => {
    console.log('New client connected');
})

httpServer.listen(3000);