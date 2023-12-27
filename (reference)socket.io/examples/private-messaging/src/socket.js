import { io } from "socket.io-client";

//run ipconfig getifaddr en0
//home 
// const URL = "http://192.168.86.27:3000";

//office
//const URL = "http://10.35.122.97:3000";

//hotspot
const URL = "http://172.20.10.2:3000"

const socket = io(URL, { autoConnect: false });

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
