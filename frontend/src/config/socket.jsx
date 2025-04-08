import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  withCredentials: true,
});

// const socket = io("http://localhost:9000/", {
//   withCredentials: true,
// });

export default socket;
