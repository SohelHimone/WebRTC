import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import {useNavigate} from 'react-router-dom';

const Home=()=>{
   const [email,setEmail]=useState('');
   const [room,setRoom]=useState('');
   const navigate=useNavigate();

   //impoorting socket hook 
   const socket= useSocket();
   console.log(socket)

   const handleclick = useCallback((e)=>{
        e.preventDefault();

        // now by using socket hook we emit the event to join a rrom that other user can see the request

        socket.emit('room:join',{email,room});

   },[email,room,socket])

   //creating a funstion handlej=roojoin separtly

   const handleroomjoin= useCallback((data)=>{
    const {email,room}=data;
    console.log(`dta from baceken ${email},${room}`)
    //here by using navgite we push this user to room
    navigate(`/room/${room}`);
   },[navigate]);

   //here by using useeffect we handle to request comming from backend
   useEffect(()=>{
    //handling the request comming from backend
    socket.on('room:join',handleroomjoin);
    

    //here we need to set off so that it shouldnt repeat again again ,simply deregistering the listerner
    return()=>{
      socket.off('room:join',handleroomjoin)
    }
   },[socket,handleroomjoin])

  return(
    <div className="Lobby_container">
        <h1>Lobby</h1>

        <label>Email Id:</label>
        <input type="email" 
        placeholder="Enter Your Email" 
        id="email" value={email} 
        onChange={(e)=>setEmail(e.target.value)} required/>

        <label>Room Id:</label>
        <input type="text" 
        placeholder="Enter Room Id" 
        value={room} 
        onChange={(e)=>setRoom(e.target.value)} 
        id="room" required/>

        <button onClick={handleclick}>Join Room</button>
    </div>
  )
}

export default Home;