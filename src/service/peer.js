//creating sepaarte class to create ,offer, answer, connection with peer to peer

class PeerService{
    constructor(){
        if(!this.peer){
            //if there is no peer to peer conncetion we are creating it by RTCPeerconnction
            this.peer=new RTCPeerConnection({
                //this are iceserver of ggogle nad twilio it is used the to establish a connection between two devices over internet
                iceServers: [{
                       urls:[
                        'stun:stun.l.google.com:19302',
                        'stun:global.stun.twilio.com:3478',
                       ]
                    }
                  ]
            })
        }
    }
  
    //whenever our call get accepted we need to set our answer in localDesprition
    async setLocalDescription(ans) {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        }
    }

    //creating answer for incomming call or offer and for creating answer ,we need offer
    async getAnswer(offer){
        if(this.peer){
            //now first we will set the offer in setRemotederspition
            await this.peer.setRemoteDescription(offer);
            const ans= await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            return ans;
        }
    }

    //creting getoffer function to sent offer to other user

    async getOffer(){
        //first we check if theoir is connection or not then only we send a offer
        if(this.peer){
            const offer= await this.peer.createOffer();
            // after creating offer we are setting in it our loacldescription 
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return offer;
        }
    }
}


export default new PeerService();