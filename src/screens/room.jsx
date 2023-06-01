import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
//install react-palayer to render our stream
import ReactPlayer from 'react-player';

import peer from "../service/peer";

const Room=()=>{
   //here we use socket to listen the event and emit our event to backened
    const socket=useSocket();
    //creating state to maintain remote user status whether it is connected to room or not
    const [remoteuser,setRemoteuser]=useState();
    //cretaed stream state
    const [mystream,setMystream]=useState();

    //created remote stream
    const[remoteStream,setRemoteStream]=useState();

   

    const handleuserjoined=useCallback(({email,id})=>{
          console.log(`user ${email} joined room ${id}`)
          setRemoteuser(id);
    },[])
    

     //created call button to streams over video or audio
     const handlecall=useCallback(async()=>{


        try {
            const stream= await navigator.mediaDevices.getUserMedia({
            video:true,
            audio:true
        })
        //once the stream is created so we need to send our offer to user  who can see our stream
        const offer=await peer.getOffer();
        //send offer by our socket
        socket.emit('user:call',{to:remoteuser,offer})
        setMystream(stream);
    }catch (error) {
        console.error('Error accessing media devices:', error);
      }
    }, [socket, remoteuser]);


    const handleincommingcall=useCallback(async({from,offer})=>{
        setRemoteuser(from)
       

        //now before sending the ans to remote user we will make visible its stream
        const stream= await navigator.mediaDevices.getUserMedia({
            video:true,
            audio:true
        })
        setMystream(stream);
        console.log(`Incoming Call`,from,offer)


         //whenever  thier is incomming call we will create ans and accept the call and send that ans so that other user can accept the ans
        const ans= await peer.getAnswer(offer);
        //now we can send the ans
        socket.emit('call:accepted',{to:from,ans})
       
  },[socket])

  const sendStream=useCallback(()=>{
    for(const track of mystream.getTracks()){
        //here we adding track in peer from mystream ,indirectly we are looping on mystreams
        peer.peer.addTrack(track,mystream);
     }
  },[mystream])

  const handlecallaccepted = useCallback(({ from, ans }) => {
     peer.setLocalDescription(ans);
     console.log('Call Accepted', from, ans);

     //after call:accept we need send our streams so send it in from of tracks,created function sendStream()
     sendStream()
  }, [sendStream]);


   const handlenegoneeded=useCallback(async()=>{
    //so to reconnect we need to create offer again
    const offer =await peer.getOffer();
    //after offer created it need to be send/emit to negotaite
    socket.emit('peer:nego:needed',{to:remoteuser,offer})
    },[socket,remoteuser])

    const handlenegoincomming=useCallback(async({from,offer})=>{
        //after geeting negotaion call we to give answer of nego so ans created here
         const ans = await peer.getAnswer(offer);
         //sending the ans
         socket.emit('peer:nego:done',{to:from,ans});
    },[socket])

    const handlenegofinal=useCallback(async({ans})=>{
       //seting localdespriction the finall ans 
       await peer.setLocalDescription(ans)
    },[])

  //created useefect for negotion ,it means to reconnect even though the connection and done so ,here we are handle here negotatiton event

  useEffect(()=>{
    peer.peer.addEventListener('negotiationneeded',handlenegoneeded);

    //we need to deregister the event
    return()=>{
        peer.peer.removeEventListener('negotiationneeded',handlenegoneeded);
    }
  },[handlenegoneeded])

   //creating differnt useeffect for track so whenever new track or streams come it should render
   useEffect(()=>{
    peer.peer.addEventListener('track',async(e)=>{
        //created remotestream by track with event e
        const remoteStream=e.streams;
        console.log('Getting Tracks')
        setRemoteStream(remoteStream[0])//bcoz coming streams is array 
    })
   },[])

    useEffect(()=>{
        socket.on('user:joined',handleuserjoined)
        socket.on('incoming:call',handleincommingcall)
        socket.on('call:accepted',handlecallaccepted)
        socket.on('peer:nego:needed',handlenegoincomming)
        socket.on('peer:nego:final',handlenegofinal)


        return()=>{
            socket.off('user:joined',handleuserjoined)
            socket.off('incoming:call',handleincommingcall)
            socket.off('call:accepted',handlecallaccepted)
            socket.off('peer:nego:needed',handlenegoincomming)
            socket.off('peer:nego:final',handlenegofinal)
        }
    },[socket,handleuserjoined,handleincommingcall,handlecallaccepted,handlenegoincomming,handlenegofinal])
   return(
    <div>
        <h1>Room Page</h1>
        <h4>{remoteuser ? 'connected':'No one in Room'}</h4>
        {mystream && <button onClick={sendStream}>Send Stream</button>}
        {remoteuser &&<button onClick={handlecall}>Call</button>}
        
        {mystream &&  (<>
            <h2>My Stream</h2> 
        <ReactPlayer url={mystream} 
            playing muted 
            width={200} height={300}>
            </ReactPlayer>
        </>)}
        {remoteStream &&  (<>
            <h2>Remote Stream</h2> 
        <ReactPlayer url={remoteStream} 
            playing muted 
            width={200} height={300}>
            </ReactPlayer>
        </>)}
        
        
    </div>
   )
}

export default Room