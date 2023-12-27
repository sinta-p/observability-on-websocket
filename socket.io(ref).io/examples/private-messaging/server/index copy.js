const { response } = require("express");
const { url } = require("inspector");
const tracer = require('dd-trace').init({
  profiling: true,
  env: 'prod',
  service: 'websocket-main-app',
  version: '1.0.3'
});

// Initialisation of HTTP Server
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: ["http://localhost:8080","http://192.168.86.27:8080","http://10.35.122.58:8080","http://10.35.127.32:3000"],
  },
});

//list of all users
const globalUsers = []
//convert socket id to username 
function convertIdToUsername(targetUserId){

  for ( let x=0; x<globalUsers.length; x++){
    userData = globalUsers[x]
    if (userData.userID == String(targetUserId)) {
      return userData.username
    }
  }
}

// scanner for picking up keyword 
function scanForKeyword(msg){
  const msg_lower = msg.toLowerCase()
  const msg_arr = msg.split(' ')
  if (msg_arr.includes('sin') || msg_lower.startsWith('sin')) {
    return "sin"
  }
}

scanForKeyword = tracer.wrap('scan_for_keyword', { resource: 'scanForKeyword' }, scanForKeyword)

function notSin(value) {
  return value != 'sin'
}
function removeSinFromMessage(msg) {
  const msg_lower = msg.toLowerCase()
  const msg_arr = msg_lower.split(' ')

  let filtered_arr = msg_arr.filter(notSin)

  filtered_msg = filtered_arr.join(' ')

  return filtered_msg
}

async function callSentimentApp(sentence){

  var fetch = require('node-fetch')

  const body = {"sentence": sentence}

  const response = await fetch('http://127.0.0.1:5000/analyse', {
    method: 'post',
    body: JSON.stringify(body),
    headers: {"Content-Type":"application/json"}
  })

  const data = await response.json()

  return data
}

async function sentimentAnalyse(msg){
  // const url = require('url')
  var result = {}


  // first remove sin 
  const toBeEvaluated = removeSinFromMessage(msg)

  let res =  await callSentimentApp(toBeEvaluated)

  result = res 
  // res.then(function(response){
  //   result = response
  //   console.log(result)
  // })  

  
  
  return result
  
  
}

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  next();
});

io.on("connection", (socket) => {
  // fetch existing users
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username,
    });
    globalUsers.push({
      userID: id,
      username: socket.username,
    });
  }
  socket.emit("users", users);
  // console.log(users)

  // notify existing users
  socket.broadcast.emit("user connected", {
    userID: socket.id,
    username: socket.username,
  });

  // forward the private message to the right recipient
  socket.on("private message", ({ content, to }) => {
    console.log(socket.username, " ==> ", convertIdToUsername(to), ": ", content)
    socket.to(to).emit("private message", {
      content,
      from: socket.id,
    });
    //broadcast at the mention of sin
    results = scanForKeyword(content)
    if (results == "sin") {
      console.log("Sin was mentioned")
      const everything = async () => {
        sa_results = sentimentAnalyse(content)
        return sa_results
      }

      everything().then((result)=>{
        console.log(result)
        let sa_flag = result['result']
        if (sa_flag == 'pos') { 
          socket.broadcast.emit("sin-notification", {
            content,
            from: socket.username,
            to: convertIdToUsername(to),
          }) 
        }
      })
      
    }
  });

  // notify users upon disconnection
  socket.on("disconnect", () => {
    socket.broadcast.emit("user disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () =>
  console.log(`server listening at http://localhost:${PORT}`)
);
