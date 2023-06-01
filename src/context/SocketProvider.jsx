import React, { createContext, useContext, useMemo } from "react";
import {io} from 'socket.io-client';

const SocketContext=createContext(null);

//exporting custom hook useSocket so no need to rewrite the whole context again again 
export const useSocket=()=>{
    const socket= useContext(SocketContext);
    return socket;
}

export const SocketProvider=(props)=>{
   
    //connecting backened to frontent by socket.io-client
    const socket= useMemo(()=>{
        return io('localhost:8000')
     },[])
    return(
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    )
}