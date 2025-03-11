// import React, { useEffect, useRef, useState } from 'react';
// import { io } from "socket.io-client";
// import TextField from '@mui/material/TextField';
// import Button from '@mui/material/Button';

// const server_url = "http://localhost:8000";

// const peerConfigConnections = {
//     iceServers: [
//         { urls: "stun:stun.l.google.com:19302" }
//     ]
// };

// export default function VideoMeet() {
//     const socketRef = useRef(null);
//     const socketIdRef = useRef(null);
//     const localVideoRef = useRef(null);
//     const connections = useRef({});
//     const videoRef = useRef([]);
//     const [video, setVideo] = useState(false);
//     const [audio, setAudio] = useState(false);
    
//     const [videoAvailable, setVideoAvailable] = useState(false);
//     const [audioAvailable, setAudioAvailable] = useState(false);
//     const [screenAvailable, setScreenAvailable] = useState(false);
//     const [videos, setVideos] = useState([]);
//     const [username, setUsername] = useState("");
//     const [askForUsername, setAskForUsername] = useState(true);

//     const getPermissions = async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

//             if (stream) {
//                 setVideoAvailable(true);
//                 setAudioAvailable(true);
//                 window.localStream = stream;
//                 if (localVideoRef.current) {
//                     localVideoRef.current.srcObject = stream;
//                 }
//             }

//             if (navigator.mediaDevices.getDisplayMedia) {
//                 setScreenAvailable(true);
//             } else {
//                 setScreenAvailable(false);
//             }
//         } catch (error) {
//             console.error("Error accessing media devices:", error);
//         }
//     };

//     const getUserMediaSuccess = (stream) => {
//         try {
//             window.localStream.getTracks().forEach(track => track.stop());
//         } catch (e) {
//             console.log(e);
//         }

//         window.localStream = stream;
//         localVideoRef.current.srcObject = stream;

//         for (let id in connections.current) {
//             if (id === socketIdRef.current) continue;

//             connections.current[id].addStream(window.localStream);
//             connections.current[id].createOffer().then((description) => {
//                 connections.current[id].setLocalDescription(description).then(() => {
//                     socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections.current[id].localDescription }));
//                 }).catch(e => console.log(e));
//             }).catch(e => console.log(e));

//             stream.getTracks().forEach(track => {
//                 track.onended = () => {
//                     setAudio(false);
//                     setVideo(false);
//                     try {
//                         let tracks = localVideoRef.current.srcObject.getTracks();
//                         tracks.forEach(track => track.stop());
//                     } catch (e) {
//                         console.log(e);
//                     }
//                     let blacksilence = (...args) => {
//                         new MediaStream([black(...args), silence()]);
            
//                         window.localStream = blacksilence();
//                         localVideoRef.current.srcObject = window.localStream;
//                     }
//                     for (let id in connections.current) {
//                         connections.current[id].addStream(window.localStream);
//                         connections.current[id].createOffer().then((description) => {
//                             socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections.current[id].localDescription }));
//                         }).catch(e => console.log(e));
//                     }
//                 };
//             });
//         }
//     };
    
//     let silence = () => {
//         let ctx = new AudioContext();
//         let oscillator = ctx.createOscillator();
//         let dst = oscillator.connect(ctx.createMediaStreamDestination());
//         oscillator.start();
//         ctx.resume();
//         return Object.assign(dst.stream.getAudioTracks()[0], {enabled: false});
//     };
    
//     let black = ({width = 640, height = 480} = {}) => {
//         let canvas = Object.assign(document.createElement("canvas"), {width, height});
//         canvas.getContext('2d').fillRect(0, 0, width, height);
//         let stream = canvas.captureStream();
//         return Object.assign(stream.getVideoTracks()[0], {enabled: false});
//     };

//     const getUserMedia = () => {
//         if ((video && videoAvailable) || (audio && audioAvailable)) {
//             navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
//                 .then((stream) => {
//                     if (localVideoRef.current) {
//                         localVideoRef.current.srcObject = stream;
//                     }
//                     console.log("User media stream obtained successfully");
//                 })
//                 .catch((error) => console.error("Error accessing user media:", error));
//         } else {
//             try {
//                 if (localVideoRef.current && localVideoRef.current.srcObject) {
//                     let tracks = localVideoRef.current.srcObject.getTracks();
//                     tracks.forEach(track => track.stop());
//                     localVideoRef.current.srcObject = null; // Remove stream reference
//                 }
//             } catch (error) {
//                 console.error("Error stopping tracks:", error);
//             }
//         }
//     };

//     useEffect(() => {
//         if (video !== undefined && audio !== undefined) {
//             getUserMedia();
//         }
//     }, [audio, video]);

//     useEffect(() => {
//         getPermissions();
//     }, []);

//     const gotMessagesFromServer = (fromId, message) => {
//         const signal = JSON.parse(message);

//         if (fromId !== socketIdRef.current) {
//             if (signal.sdp) {
//                 connections.current[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
//                     .then(() => {
//                         if (signal.sdp.type === "offer") {
//                             connections.current[fromId].createAnswer()
//                                 .then((description) => {
//                                     connections.current[fromId].setLocalDescription(description)
//                                         .then(() => {
//                                             socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections.current[fromId].localDescription }));
//                                         })
//                                         .catch(e => console.error(e));
//                                 })
//                                 .catch(e => console.error(e));
//                         }
//                     })
//                     .catch(e => console.error(e));
//             }

//             if (signal.ice) {
//                 connections.current[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
//             }
//         }
//     };
    
//     let addmessage = () => {};

//     const connectToSocket = () => {
//         socketRef.current = io(server_url);
//         socketRef.current.on('signal', gotMessagesFromServer);

//         socketRef.current.on("connect", () => {
//             socketRef.current.emit("join-call", window.location.href);
//             socketIdRef.current = socketRef.current.id;

//             socketRef.current.on("chat-message", addmessage);
//             socketRef.current.on("user-left", (id) => {
//                 setVideos((videos) => videos.filter((video) => video.socketId !== id));
//             });
//         });

//         socketRef.current.on("user-joined", (id, clients) => {
//             console.log("User joined:", id);
//             clients.forEach((socketListId) => {
//                 connections.current[socketListId] = new RTCPeerConnection({
//                     iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
//                 });
                
//                 // ✅ Handle ICE Candidates
//                 connections.current[socketListId].onicecandidate = (event) => {
//                     if (event.candidate) {
//                         socketRef.current.emit("signal", socketListId, JSON.stringify({ ice: event.candidate }));
//                     }
//                 };
                
//                 connections.current[socketListId].onaddstream = (event) => {
//                     let videoExists = videoRef.current.find(video => video.socketId === socketListId);
//                     if (videoExists) {
//                         setVideos(videos => {
//                             const updatedVideos = videos.map(video => 
//                                 video.socketId === socketListId ? {...video, stream: event.stream} : video
//                             );
//                             videoRef.current = updatedVideos;
//                             return updatedVideos;
//                         });
//                     } else {
//                         let newVideo = {
//                             socketId: socketListId,
//                             stream: event.stream,
//                             autoPlay: true,
//                             playsInline: true
//                         };
//                         setVideos(videos => {
//                             const updatedVideos = [...videos, newVideo];
//                             videoRef.current = updatedVideos;
//                             return updatedVideos;
//                         });
//                     }
//                 };
                
//                 if (window.localStream !== undefined && window.localStream !== null) {
//                     connections.current[socketListId].addStream(window.localStream);
//                 } else {
//                     let blacksilence = (...args) => {
//                         const stream = new MediaStream([black(...args), silence()]);
//                         window.localStream = stream;
//                         connections.current[socketListId].addStream(window.localStream);
//                     };
//                     blacksilence();
//                 }
//             });
            
//             if (id === socketIdRef.current) {
//                 for (let id2 in connections.current) {
//                     if (id2 === socketIdRef.current) continue;
            
//                     try {
//                         connections.current[id2].addStream(window.localStream);
//                     } catch (e) {
//                         console.error("Error adding local stream:", e);
//                     }
            
//                     connections.current[id2].createOffer().then((description) => {
//                         connections.current[id2].setLocalDescription(description).then(() => {
//                             socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections.current[id2].localDescription }));
//                         }).catch(error => console.error("Error setting local description:", error));
//                     }).catch(error => console.error("Error creating offer:", error));
//                 }
//             }
//         });

//         socketRef.current.on("signal", gotMessagesFromServer);
//     };

//     const getMedia = () => {
//         setVideo(videoAvailable);
//         setAudio(audioAvailable);
//         connectToSocket();
//     };

//     const handleConnect = () => {
//         setAskForUsername(false);
//         getMedia();
//     };

//     return (
//         <>
//             <div className="video-meet-container">
//                 {askForUsername ? (
//                     <div className="username-input">
//                         <h2>Enter into lobby</h2>
//                         <TextField
//                             label="Username"
//                             value={username}
//                             onChange={(e) => setUsername(e.target.value)}
//                             variant="outlined"
//                         />
//                         <Button variant="contained" onClick={handleConnect}>Connect</Button>
//                         <div>
//                             <video ref={localVideoRef} autoPlay muted></video>
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="video-call">
//                         <video ref={localVideoRef} autoPlay muted></video>
//                         {videos.map((videoItem) => (
//                             <div key={videoItem.socketId}>
//                                 <h2>{videoItem.socketId}</h2>
//                                 <video
//                                     data-socket={videoItem.socketId}
//                                     ref={ref => {
//                                         if (ref && videoItem.stream) {
//                                             ref.srcObject = videoItem.stream;
//                                         }
//                                     }}
//                                     autoPlay
//                                 ></video>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </>
//     );
// }



// import React, { useEffect, useRef, useState } from 'react'
// import io from "socket.io-client";
// import { Badge, IconButton, TextField } from '@mui/material';
// import { Button } from '@mui/material';
// import VideocamIcon from '@mui/icons-material/Videocam';
// import VideocamOffIcon from '@mui/icons-material/VideocamOff'
//  import styles from "../styles/videoComponent.css";
// import CallEndIcon from '@mui/icons-material/CallEnd'
// import MicIcon from '@mui/icons-material/Mic'
// import MicOffIcon from '@mui/icons-material/MicOff'
// import ScreenShareIcon from '@mui/icons-material/ScreenShare';
// import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
// import ChatIcon from '@mui/icons-material/Chat'
// import server from '../environment';

// const server_url = server;

// var connections = {};

// const peerConfigConnections = {
//     "iceServers": [
//         { "urls": "stun:stun.l.google.com:19302" }
//     ]
// }

// export default function VideoMeetComponent() {

//     var socketRef = useRef();
//     let socketIdRef = useRef();

//     let localVideoref = useRef();

//     let [videoAvailable, setVideoAvailable] = useState(true);

//     let [audioAvailable, setAudioAvailable] = useState(true);

//     let [video, setVideo] = useState([]);

//     let [audio, setAudio] = useState();

//     let [screen, setScreen] = useState();

//     let [showModal, setModal] = useState(true);

//     let [screenAvailable, setScreenAvailable] = useState();

//     let [messages, setMessages] = useState([])

//     let [message, setMessage] = useState("");

//     let [newMessages, setNewMessages] = useState(3);

//     let [askForUsername, setAskForUsername] = useState(true);

//     let [username, setUsername] = useState("");

//     const videoRef = useRef([])

//     let [videos, setVideos] = useState([])

//     // TODO
//     // if(isChrome() === false) {


//     // }

//     useEffect(() => {
//         console.log("HELLO")
//         getPermissions();

//     })

//     let getDislayMedia = () => {
//         if (screen) {
//             if (navigator.mediaDevices.getDisplayMedia) {
//                 navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
//                     .then(getDislayMediaSuccess)
//                     .then((stream) => { })
//                     .catch((e) => console.log(e))
//             }
//         }
//     }

//     const getPermissions = async () => {
//         try {
//             const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
//             if (videoPermission) {
//                 setVideoAvailable(true);
//                 console.log('Video permission granted');
//             } else {
//                 setVideoAvailable(false);
//                 console.log('Video permission denied');
//             }

//             const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
//             if (audioPermission) {
//                 setAudioAvailable(true);
//                 console.log('Audio permission granted');
//             } else {
//                 setAudioAvailable(false);
//                 console.log('Audio permission denied');
//             }

//             if (navigator.mediaDevices.getDisplayMedia) {
//                 setScreenAvailable(true);
//             } else {
//                 setScreenAvailable(false);
//             }

//             if (videoAvailable || audioAvailable) {
//                 const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
//                 if (userMediaStream) {
//                     window.localStream = userMediaStream;
//                     if (localVideoref.current) {
//                         localVideoref.current.srcObject = userMediaStream;
//                     }
//                 }
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     };

//     useEffect(() => {
//         if (video !== undefined && audio !== undefined) {
//             getUserMedia();
//             console.log("SET STATE HAS ", video, audio);

//         }


//     }, [video, audio])
//     let getMedia = () => {
//         setVideo(videoAvailable);
//         setAudio(audioAvailable);
//         connectToSocketServer();

//     }




//     let getUserMediaSuccess = (stream) => {
//         try {
//             window.localStream.getTracks().forEach(track => track.stop())
//         } catch (e) { console.log(e) }

//         window.localStream = stream
//         localVideoref.current.srcObject = stream

//         for (let id in connections) {
//             if (id === socketIdRef.current) continue

//             connections[id].addStream(window.localStream)

//             connections[id].createOffer().then((description) => {
//                 console.log(description)
//                 connections[id].setLocalDescription(description)
//                     .then(() => {
//                         socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
//                     })
//                     .catch(e => console.log(e))
//             })
//         }

//         stream.getTracks().forEach(track => track.onended = () => {
//             setVideo(false);
//             setAudio(false);

//             try {
//                 let tracks = localVideoref.current.srcObject.getTracks()
//                 tracks.forEach(track => track.stop())
//             } catch (e) { console.log(e) }

//             let blackSilence = (...args) => new MediaStream([black(...args), silence()])
//             window.localStream = blackSilence()
//             localVideoref.current.srcObject = window.localStream

//             for (let id in connections) {
//                 connections[id].addStream(window.localStream)

//                 connections[id].createOffer().then((description) => {
//                     connections[id].setLocalDescription(description)
//                         .then(() => {
//                             socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
//                         })
//                         .catch(e => console.log(e))
//                 })
//             }
//         })
//     }

//     let getUserMedia = () => {
//         if ((video && videoAvailable) || (audio && audioAvailable)) {
//             navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
//                 .then(getUserMediaSuccess)
//                 .then((stream) => { })
//                 .catch((e) => console.log(e))
//         } else {
//             try {
//                 let tracks = localVideoref.current.srcObject.getTracks()
//                 tracks.forEach(track => track.stop())
//             } catch (e) { }
//         }
//     }
    




//     let getDislayMediaSuccess = (stream) => {
//         console.log("HERE")
//         try {
//             window.localStream.getTracks().forEach(track => track.stop())
//         } catch (e) { console.log(e) }

//         window.localStream = stream
//         localVideoref.current.srcObject = stream

//         for (let id in connections) {
//             if (id === socketIdRef.current) continue

//             connections[id].addStream(window.localStream)

//             connections[id].createOffer().then((description) => {
//                 connections[id].setLocalDescription(description)
//                     .then(() => {
//                         socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
//                     })
//                     .catch(e => console.log(e))
//             })
//         }

//         stream.getTracks().forEach(track => track.onended = () => {
//             setScreen(false)

//             try {
//                 let tracks = localVideoref.current.srcObject.getTracks()
//                 tracks.forEach(track => track.stop())
//             } catch (e) { console.log(e) }

//             let blackSilence = (...args) => new MediaStream([black(...args), silence()])
//             window.localStream = blackSilence()
//             localVideoref.current.srcObject = window.localStream

//             getUserMedia()

//         })
//     }

//     let gotMessageFromServer = (fromId, message) => {
//         var signal = JSON.parse(message)

//         if (fromId !== socketIdRef.current) {
//             if (signal.sdp) {
//                 connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
//                     if (signal.sdp.type === 'offer') {
//                         connections[fromId].createAnswer().then((description) => {
//                             connections[fromId].setLocalDescription(description).then(() => {
//                                 socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
//                             }).catch(e => console.log(e))
//                         }).catch(e => console.log(e))
//                     }
//                 }).catch(e => console.log(e))
//             }

//             if (signal.ice) {
//                 connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
//             }
//         }
//     }

    



//     let connectToSocketServer = () => {
//         socketRef.current = io.connect(server_url, { secure: false })

//         socketRef.current.on('signal', gotMessageFromServer)

//         socketRef.current.on('connect', () => {
//             socketRef.current.emit('join-call', window.location.href)
//             socketIdRef.current = socketRef.current.id

//             socketRef.current.on('chat-message', addMessage)

//             socketRef.current.on('user-left', (id) => {
//                 setVideos((videos) => videos.filter((video) => video.socketId !== id))
//             })

//             socketRef.current.on('user-joined', (id, clients) => {
//                 clients.forEach((socketListId) => {

//                     connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
//                     // Wait for their ice candidate       
//                     connections[socketListId].onicecandidate = function (event) {
//                         if (event.candidate != null) {
//                             socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
//                         }
//                     }

//                     // Wait for their video stream
//                     connections[socketListId].onaddstream = (event) => {
//                         console.log("BEFORE:", videoRef.current);
//                         console.log("FINDING ID: ", socketListId);

//                         let videoExists = videoRef.current.find(video => video.socketId === socketListId);

//                         if (videoExists) {
//                             console.log("FOUND EXISTING");

//                             // Update the stream of the existing video
//                             setVideos(videos => {
//                                 const updatedVideos = videos.map(video =>
//                                     video.socketId === socketListId ? { ...video, stream: event.stream } : video
//                                 );
//                                 videoRef.current = updatedVideos;
//                                 return updatedVideos;
//                             });
//                         } else {
//                             // Create a new video
//                             console.log("CREATING NEW");
//                             let newVideo = {
//                                 socketId: socketListId,
//                                 stream: event.stream,
//                                 autoplay: true,
//                                 playsinline: true
//                             };

//                             setVideos(videos => {
//                                 const updatedVideos = [...videos, newVideo];
//                                 videoRef.current = updatedVideos;
//                                 return updatedVideos;
//                             });
//                         }
//                     };


//                     // Add the local video stream
//                     if (window.localStream !== undefined && window.localStream !== null) {
//                         connections[socketListId].addStream(window.localStream)
//                     } else {
//                         let blackSilence = (...args) => new MediaStream([black(...args), silence()])
//                         window.localStream = blackSilence()
//                         connections[socketListId].addStream(window.localStream)
//                     }
//                 })

//                 if (id === socketIdRef.current) {
//                     for (let id2 in connections) {
//                         if (id2 === socketIdRef.current) continue

//                         try {
//                             connections[id2].addStream(window.localStream)
//                         } catch (e) { }

//                         connections[id2].createOffer().then((description) => {
//                             connections[id2].setLocalDescription(description)
//                                 .then(() => {
//                                     socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
//                                 })
//                                 .catch(e => console.log(e))
//                         })
//                     }
//                 }
//             })
//         })
//     }

//     let silence = () => {
//         let ctx = new AudioContext()
//         let oscillator = ctx.createOscillator()
//         let dst = oscillator.connect(ctx.createMediaStreamDestination())
//         oscillator.start()
//         ctx.resume()
//         return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
//     }
//     let black = ({ width = 640, height = 480 } = {}) => {
//         let canvas = Object.assign(document.createElement("canvas"), { width, height })
//         canvas.getContext('2d').fillRect(0, 0, width, height)
//         let stream = canvas.captureStream()
//         return Object.assign(stream.getVideoTracks()[0], { enabled: false })
//     }

//     let handleVideo = () => {
//         setVideo(!video);
//         // getUserMedia();
//     }
//     let handleAudio = () => {
//         setAudio(!audio)
//         // getUserMedia();
//     }

//     useEffect(() => {
//         if (screen !== undefined) {
//             getDislayMedia();
//         }
//     }, [screen])
//     let handleScreen = () => {
//         setScreen(!screen);
//     }

//     let handleEndCall = () => {
//         try {
//             let tracks = localVideoref.current.srcObject.getTracks()
//             tracks.forEach(track => track.stop())
//         } catch (e) { }
//         window.location.href = "/"
//     }

//     let openChat = () => {
//         setModal(true);
//         setNewMessages(0);
//     }
//     let closeChat = () => {
//         setModal(false);
//     }
//     let handleMessage = (e) => {
//         setMessage(e.target.value);
//     }

//     const addMessage = (data, sender, socketIdSender) => {
//         setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: sender, data: data }
//         ]);
//         if (socketIdSender !== socketIdRef.current) {
//             setNewMessages((prevNewMessages) => prevNewMessages + 1);
//         }
//     };



//     let sendMessage = () => {
//         console.log(socketRef.current);
//         socketRef.current.emit('chat-message', message, username)
//         setMessage("");

//        this.setState({ message: "", sender: username })
//      }

    
//     let connect = () => {
//         setAskForUsername(false);
//         getMedia();
//     }


//     return (
//         <div>

//             {askForUsername === true ?

//                 <div>


//                     <h2>Enter into Lobby </h2>
//                     <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
//                     <Button variant="contained" onClick={connect}>Connect</Button>


//                     <div>
//                         <video ref={localVideoref} autoPlay muted></video>
//                     </div>

//                 </div> :


//                 <div className={styles.meetVideoContainer}>

//                     {showModal ? <div className={styles.chatRoom}>

//                         <div className={styles.chatContainer}>
//                             <h1>Chat</h1>

//                             <div className={styles.chattingDisplay}>

//                                 {messages.length !== 0 ? messages.map((item, index) => {

//                                     console.log(messages)
//                                     return (
//                                         <div style={{ marginBottom: "20px" }} key={index}>
//                                             <p style={{ fontWeight: "bold" }}>{item.sender}</p>
//                                             <p>{item.data}</p>
//                                         </div>
//                                     )
//                                 }) : <p>No Messages Yet</p>}


//                             </div>

//                             <div className={styles.chattingArea}>
//                                 <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter Your chat" variant="outlined" />
//                                 <Button variant='contained' onClick={sendMessage}>Send</Button>
//                             </div>


//                         </div>
//                     </div> : <></>}


//                     <div className={styles.buttonContainers}>
//                         <IconButton onClick={handleVideo} style={{ color: "white" }}>
//                             {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
//                         </IconButton>
//                         <IconButton onClick={handleEndCall} style={{ color: "red" }}>
//                             <CallEndIcon  />
//                         </IconButton>
//                         <IconButton onClick={handleAudio} style={{ color: "white" }}>
//                             {audio === true ? <MicIcon /> : <MicOffIcon />}
//                         </IconButton>

//                         {screenAvailable === true ?
//                             <IconButton onClick={handleScreen} style={{ color: "white" }}>
//                                 {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
//                             </IconButton> : <></>}

//                         <Badge badgeContent={newMessages} max={999} color='orange'>
//                             <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
//                                 <ChatIcon />                        </IconButton>
//                         </Badge>

//                     </div>


//                     <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>

//                     <div className={styles.conferenceView}>
//                         {videos.map((video) => (
//                             <div key={video.socketId}>
//                                 <video

//                                     data-socket={video.socketId}
//                                     ref={ref => {
//                                         if (ref && video.stream) {
//                                             ref.srcObject = video.stream;
//                                         }
//                                     }}
//                                     autoPlay
//                                 >
//                                 </video>
//                             </div>

//                         ))}

//                     </div>

//                 </div>

//             }

//         </div>
    



















































































































































































































































































// import React, { useEffect, useRef, useState } from 'react';
// import { io } from "socket.io-client";
// import TextField from '@mui/material/TextField';
// import Button from '@mui/material/Button';

// const server_url = "http://localhost:8000";

// const peerConfigConnections = {
//     iceServers: [
//         { urls: "stun:stun.l.google.com:19302" }
//     ]
// };

// export default function VideoMeet() {
//     const socketRef = useRef(null);
//     const socketIdRef = useRef(null);
//     const localVideoRef = useRef(null);
//     const connections = useRef({});
//     const videoRef = useRef([]);
//     const [video, setVideo] = useState(false);
//     const [audio, setAudio] = useState(false);
    
//     const [videoAvailable, setVideoAvailable] = useState(false);
//     const [audioAvailable, setAudioAvailable] = useState(false);
//     const [screenAvailable, setScreenAvailable] = useState(false);
//     const [videos, setVideos] = useState([]);
//     const [username, setUsername] = useState("");
//     const [askForUsername, setAskForUsername] = useState(true);

//     const getPermissions = async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

//             if (stream) {
//                 setVideoAvailable(true);
//                 setAudioAvailable(true);
//                 window.localStream = stream;
//                 if (localVideoRef.current) {
//                     localVideoRef.current.srcObject = stream;
//                 }
//             }

//             if (navigator.mediaDevices.getDisplayMedia) {
//                 setScreenAvailable(true);
//             } else {
//                 setScreenAvailable(false);
//             }
//         } catch (error) {
//             console.error("Error accessing media devices:", error);
//         }
//     };

//     const getUserMediaSuccess = (stream) => {
//         try {
//             window.localStream.getTracks().forEach(track => track.stop());
//         } catch (e) {
//             console.log(e);
//         }

//         window.localStream = stream;
//         localVideoRef.current.srcObject = stream;

//         for (let id in connections.current) {
//             if (id === socketIdRef.current) continue;

//             connections.current[id].addStream(window.localStream);
//             connections.current[id].createOffer().then((description) => {
//                 connections.current[id].setLocalDescription(description).then(() => {
//                     socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections.current[id].localDescription }));
//                 }).catch(e => console.log(e));
//             }).catch(e => console.log(e));

//             stream.getTracks().forEach(track => {
//                 track.onended = () => {
//                  setAudio(false);
//                  setVideo(false);
//                     try {
//                         let tracks = localVideoRef.current.srcObject.getTracks();
//                         tracks.forEach(track => track.stop());
//                     } catch (e) {
//                         console.log(e);
//                     }
//                     let blacksilence = (...args) =>{
//                         new MediaStream([black(...args) , silence()]);
            
//                         window.localStream = blacksilence();
//                       localVideoRef.current.srcObject = window.localStream;
//                     }
//                     for (let id in connections.current) {
//                         connections.current[id].addStream(window.localStream);
//                         connections.current[id].createOffer().then((description) => {
//                             socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections.current[id].localDescription }));
//                         }).catch(e => console.log(e));
//                     }
//                 };
//             });
//         }
//     };
// let silence =  () =>{
//     let ctx = new AudioContext()
//     let osillator = ctx.createOscillator();
//     let dst = osillator.connect(ctx.createMediaStreamDestination());
//     osillator.start();
//     ctx.resume()
//     return Object.assign(dst.stream.getAudioTracks()[0], {enabled : faise})
// }
// let black = ({width = 640 , height= 480}={})=>{
// let canvas = Object.assign(document.createElement("canvas") , {width , height});
// canvas.getContext('2d').fillRect(0 , 0 , width , height);
// return Object.assign(stream.getVideoTracks()[0] , {enabled : false});
// }
//     const getUserMedia = () => {
//         if ((video && videoAvailable) || (audio && audioAvailable)) {
//             navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
//                 .then((stream) => {
//                     if (localVideoRef.current) {
//                         localVideoRef.current.srcObject = stream;
//                     }
//                     console.log("User media stream obtained successfully");
//                 })
//                 .catch((error) => console.error("Error accessing user media:", error));
//         } else {
//             try {
//                 if (localVideoRef.current && localVideoRef.current.srcObject) {
//                     let tracks = localVideoRef.current.srcObject.getTracks();
//                     tracks.forEach(track => track.stop());
//                     localVideoRef.current.srcObject = null; // Remove stream reference
//                 }
//             } catch (error) {
//                 console.error("Error stopping tracks:", error);
//             }
//         }
//     };

//     useEffect(() => {
//         if (video !== undefined && audio !== undefined) {
//             getUserMedia();
//         }
//     }, [audio, video]);

//     useEffect(() => {
//         getPermissions();
//     }, [videoAvailable, audioAvailable]);

//     const gotMessagesFromServer = (fromId, message) => {
//         const signal = JSON.parse(message);

//         if (fromId !== socketIdRef.current) {
//             if (signal.sdp) {
//                 connections.current[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
//                     .then(() => {
//                         if (signal.sdp.type === "offer") {
//                             connections.current[fromId].createAnswer()
//                                 .then((description) => {
//                                     connections.current[fromId].setLocalDescription(description)
//                                         .then(() => {
//                                             socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections.current[fromId].localDescription }));
//                                         })
//                                         .catch(e => console.error(e));
//                                 })
//                                 .catch(e => console.error(e));
//                         }
//                     })
//                     .catch(e => console.error(e));
//             }

//             if (signal.ice) {
//                 connections.current[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
//             }
//         }
//     };
//     let addmessage = () => {}

//     const connectToSocket = () => {
//         socketRef.current = io(server_url);
//         socketRef.current.on('signal', gotMessagesFromServer);

//         socketRef.current.on("connect", () => {
//             socketRef.current.emit("join-call", window.location.href);
//             socketIdRef.current = socketRef.current.id;

//             socketRef.current.on("chat-message", addmessage);
//             socketRef.current.on("user-left", (id) => {
//                 setVideos((videos) => videos.filter((video) => video.socketId !== id));
//             });
//         });

//         socketRef.current.on("user-joined", (id, clients) => {
//             console.log("User joined:", id);
//             clients.forEach((socketListId) => {
//                 connections.current[socketListId] = new RTCPeerConnection({
//                     iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
//                 });
//             });

//             // ✅ Handle ICE Candidates
//             connections.current[socketListId].onicecandidate = (event) => {
//                 if (event.candidate) {
//                     socketRef.current.emit("signal", socketListId, JSON.stringify({ ice: event.candidate }));
//                 }
//             };
// connections[socketListId].onaddstream = (event) =>{
//     let videoExits = videoRef.current.find(video => video.socketId === socketListId);
//     if(videoExits){
//         setVideo(videos =>{
//             const updateVideos = videos.map(video =>video.socketId == socketListId ? {...video , stream : event.stream} : video
//         )

//         videoRef.current = updateVideos;
//         return updateVideos;
//     })
//  } else{
//  let newVideo = {
//     socketId : socketListId, 
//     stream : event.stream,
//     autoPlay : true , 
//     playsInline : true 
//  }
//  setVideos(videos =>{
//     const updateVideos = [...videos , newVideo];
//     videoRef.current = updateVideos;
//     return updateVideos;
//  })



//     }
//     };
//     if(window.localStream !== undefined  && window.localStream !==null){
//         connections[socketListId].addStream(window.localStream);
//     }
//     else{
//         let blacksilence = (...args) =>{
//             new MediaStream([black(...args) , silence()]);

//             window.localStream = blacksilence();
//             connections[socketListId].addStream(window.localStream);
//         }
//     }
  
//     if (id === socketIdRef.current) {
//         for (let id2 in connections) {
//             if (id2 === socketIdRef.current) continue;
    
//             try {
//                 connections[id2].addStream(window.localStream);
//             } catch (e) {
//                 console.error("Error adding local stream:", e);
//             }
    
//             connections[id2].createOffer().then((description) => {
//                 connections[id2].setLocalDescription(description).then(() => {
//                     socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }));
//                 }).catch(error => console.error("Error setting local description:", error));
//             }).catch(error => console.error("Error creating offer:", error));
//         }
//     }
    
//             // // ✅ Handle Remote Stream
//             // connections.current[id].ontrack = (event) => {
//             //     setVideos((prevVideos) => [...prevVideos, { id, stream: event.streams[0] }]);
//             // };

//             // ✅ Add Local Stream to Connection
//             // if (window.localStream) {
//             //     window.localStream.getTracks().forEach(track => {
//             //         connections.current[id].addTrack(track, window.localStream);
//             //     });
//             // }
//         });

//         socketRef.current.on("signal", gotMessagesFromServer);
//     };

//     const getMedia = () => {
//         setVideo(videoAvailable);
//         setAudio(audioAvailable);
//         if (socketRef.current) {
//             connectToSocket();
//         }
//     };

//     return (
//         <>
//             <div className="video-meet-container">
//                 {askForUsername ? (
//                     <div className="username-input">
//                         <h2>Enter into lobby</h2>
//                         <TextField
//                             label="Username"
//                             value={username}
//                             onChange={(e) => setUsername(e.target.value)}
//                             variant="outlined"
//                         />
//                         <Button variant="contained" onClick={() => setAskForUsername(false)}>Connect</Button>
//                         <div>
//                             <video ref={localVideoRef} autoPlay muted></video>
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="video-call">
//                         <video ref={localVideoRef} autoPlay muted></video>
//                         {video.map((video)=>
//                             <div key={video.socketId}>
//                             <h2>{video.socketId}</h2>
//                             <video
//                             data-socket = {video.socketId}
//                             ref = {ref =>{
//                                 if(ref && video.stream){
//                                     ref.srcObject = video.stream;
//                                 }
//                             }}
//                             autoPlay 
//                             ></video>
//                              </div>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </>
//     );
// }




































// const server_url = "http://localhost:8000";

// function Videomeet() {
//     const socketRef = useRef(null);
//     const socketIdRef = useRef(null);
//     const localVideoRef = useRef(null);
//     const [username, setUsername] = useState("");
//     const [askForUsername, setAskForUsername] = useState(true);
//     const [videos, setVideos] = useState([]);
//     const connections = useRef({});

//     // ✅ Get user media permissions
//     useEffect(() => {
//         navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//             .then((stream) => {
//                 if (localVideoRef.current) {
//                     localVideoRef.current.srcObject = stream;
//                 }
//                 window.localStream = stream;
//             })
//             .catch(err => console.error("Error accessing media:", err));
//     }, []);

//     // ✅ Handling messages from the server
    const gotMessagesFromServer = (fromId, message) => {
        const signal = JSON.parse(message);

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections.current[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    .then(() => {
                        if (signal.sdp.type === "offer") {
                            connections.current[fromId].createAnswer()
                                .then((description) => {
                                    connections.current[fromId].setLocalDescription(description)
                                        .then(() => {
                                            socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections.current[fromId].localDescription }));
                                        })
                                        .catch(e => console.error(e));
                                })
                                .catch(e => console.error(e));
                        }
                    })
                    .catch(e => console.error(e));
            }

            if (signal.ice) {
                connections.current[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
            }
        }
    };

//     // ✅ Connect to Socket.IO Server
    // const connectToSocketServer = () => {
    //     socketRef.current = io(server_url);

    //     socketRef.current.on("connect", () => {
    //         socketRef.current.emit("join-call", window.location.href);
    //         socketIdRef.current = socketRef.current.id;
    //     });

    //     socketRef.current.on("user-joined", (id) => {
    //         console.log("User joined:", id);
    //         connections.current[id] = new RTCPeerConnection({
    //             iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    //         });

    //         // ✅ Handle ICE Candidates
    //         connections.current[id].onicecandidate = (event) => {
    //             if (event.candidate) {
    //                 socketRef.current.emit("signal", id, JSON.stringify({ ice: event.candidate }));
    //             }
    //         };

    //         // ✅ Handle Remote Stream
    //         connections.current[id].ontrack = (event) => {
    //             setVideos((prevVideos) => [...prevVideos, { id, stream: event.streams[0] }]);
    //         };

    //         // ✅ Add Local Stream to Connection
    //         if (window.localStream) {
    //             window.localStream.getTracks().forEach(track => {
    //                 connections.current[id].addTrack(track, window.localStream);
    //             });
    //         }
    //     });

    //     socketRef.current.on("signal", gotMessagesFromServer);
    // };

    // ✅ Manage Local Stream
    // const getUserMediaSuccess = (stream) => {
    //     try {
    //         window.localStream.getTracks().forEach(track => track.stop());
    //     } catch (e) {
    //         console.log(e);
    //     }

    //     window.localStream = stream;
    //     localVideoRef.current.srcObject = stream;

    //     for (let id in connections.current) {
    //         if (id === socketIdRef.current) continue;

    //         connections.current[id].addStream(window.localStream);
    //         connections.current[id].createOffer().then((description) => {
    //             connections.current[id].setLocalDescription(description).then(() => {
    //                 socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections.current[id].localDescription }));
    //             }).catch(e => console.log(e));
    //         }).catch(e => console.log(e));

    //         stream.getTracks().forEach(track => {
    //             track.onended = () => {
    //                 setVideos([]);
    //                 try {
    //                     let tracks = localVideoRef.current.srcObject.getTracks();
    //                     tracks.forEach(track => track.stop());
    //                 } catch (e) {
    //                     console.log(e);
    //                 }

    //                 for (let id in connections.current) {
    //                     connections.current[id].addStream(window.localStream);
    //                     connections.current[id].createOffer().then((description) => {
    //                         socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections.current[id].localDescription }));
    //                     }).catch(e => console.log(e));
    //                 }
    //             };
    //         });
    //     }
    // };

//     // Start connection when username is entered
//     const getMedia = () => {
//         connectToSocketServer();
//         setAskForUsername(false);
//     };

//     return (
//         <div className="video-meet-container">
//             {askForUsername ? (
//                 <div className="username-input">
//                     <h2>Enter into lobby</h2>
//                     <TextField
//                         label="Username"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         variant="outlined"
//                     />
//                     <Button variant="contained" onClick={getMedia}>Connect</Button>
//                     <div>
//                         <video ref={localVideoRef} autoPlay muted></video>
//                     </div>
//                 </div>
//             ) : (
//                 <div className="video-call">
//                     <p>Welcome, {username}, to the Video Call</p>
//                     <div className="video-grid">
//                         <video ref={localVideoRef} autoPlay muted></video>
//                         {videos.map((video, index) => (
//                             <video key={index} ref={(ref) => ref && (ref.srcObject = video.stream)} autoPlay playsInline></video>
//                         ))}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default Videomeet;
// import React, { useEffect, useRef, useState } from 'react'
// import io from "socket.io-client";
// import { Badge, IconButton, TextField } from '@mui/material';
// import { Button } from '@mui/material';
// import VideocamIcon from '@mui/icons-material/Videocam';
// import VideocamOffIcon from '@mui/icons-material/VideocamOff'
// import styles from "../styles/videoComponent.module.css";
// import CallEndIcon from '@mui/icons-material/CallEnd'
// import MicIcon from '@mui/icons-material/Mic'
// import MicOffIcon from '@mui/icons-material/MicOff'
// import ScreenShareIcon from '@mui/icons-material/ScreenShare';
// import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
// import ChatIcon from '@mui/icons-material/Chat'
// import server from '../environment';

// const server_url = server;

// var connections = {};

// const peerConfigConnections = {
//     "iceServers": [
//         { "urls": "stun:stun.l.google.com:19302" }
//     ]
// }

// export default function VideoMeetComponent() {

//     var socketRef = useRef();
//     let socketIdRef = useRef();

//     let localVideoref = useRef();

//     let [videoAvailable, setVideoAvailable] = useState(true);

//     let [audioAvailable, setAudioAvailable] = useState(true);

//     let [video, setVideo] = useState([]);

//     let [audio, setAudio] = useState();

//     let [screen, setScreen] = useState();

//     let [showModal, setModal] = useState(true);

//     let [screenAvailable, setScreenAvailable] = useState();

//     let [messages, setMessages] = useState([])

//     let [message, setMessage] = useState("");

//     let [newMessages, setNewMessages] = useState(3);

//     let [askForUsername, setAskForUsername] = useState(true);

//     let [username, setUsername] = useState("");

//     const videoRef = useRef([])

//     let [videos, setVideos] = useState([])

//     // TODO
//     // if(isChrome() === false) {


//     // }

//     useEffect(() => {
//         console.log("HELLO")
//         getPermissions();

//     })

//     let getDislayMedia = () => {
//         if (screen) {
//             if (navigator.mediaDevices.getDisplayMedia) {
//                 navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
//                     .then(getDislayMediaSuccess)
//                     .then((stream) => { })
//                     .catch((e) => console.log(e))
//             }
//         }
//     }

//     const getPermissions = async () => {
//         try {
//             const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
//             if (videoPermission) {
//                 setVideoAvailable(true);
//                 console.log('Video permission granted');
//             } else {
//                 setVideoAvailable(false);
//                 console.log('Video permission denied');
//             }

//             const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
//             if (audioPermission) {
//                 setAudioAvailable(true);
//                 console.log('Audio permission granted');
//             } else {
//                 setAudioAvailable(false);
//                 console.log('Audio permission denied');
//             }

//             if (navigator.mediaDevices.getDisplayMedia) {
//                 setScreenAvailable(true);
//             } else {
//                 setScreenAvailable(false);
//             }

//             if (videoAvailable || audioAvailable) {
//                 const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
//                 if (userMediaStream) {
//                     window.localStream = userMediaStream;
//                     if (localVideoref.current) {
//                         localVideoref.current.srcObject = userMediaStream;
//                     }
//                 }
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     };

//     useEffect(() => {
//         if (video !== undefined && audio !== undefined) {
//             getUserMedia();
//             console.log("SET STATE HAS ", video, audio);

//         }


//     }, [video, audio])
//     let getMedia = () => {
//         setVideo(videoAvailable);
//         setAudio(audioAvailable);
//         connectToSocketServer();

//     }




//     let getUserMediaSuccess = (stream) => {
//         try {
//             window.localStream.getTracks().forEach(track => track.stop())
//         } catch (e) { console.log(e) }

//         window.localStream = stream
//         localVideoref.current.srcObject = stream

//         for (let id in connections) {
//             if (id === socketIdRef.current) continue

//             connections[id].addStream(window.localStream)

//             connections[id].createOffer().then((description) => {
//                 console.log(description)
//                 connections[id].setLocalDescription(description)
//                     .then(() => {
//                         socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
//                     })
//                     .catch(e => console.log(e))
//             })
//         }

//         stream.getTracks().forEach(track => track.onended = () => {
//             setVideo(false);
//             setAudio(false);

//             try {
//                 let tracks = localVideoref.current.srcObject.getTracks()
//                 tracks.forEach(track => track.stop())
//             } catch (e) { console.log(e) }

//             let blackSilence = (...args) => new MediaStream([black(...args), silence()])
//             window.localStream = blackSilence()
//             localVideoref.current.srcObject = window.localStream

//             for (let id in connections) {
//                 connections[id].addStream(window.localStream)

//                 connections[id].createOffer().then((description) => {
//                     connections[id].setLocalDescription(description)
//                         .then(() => {
//                             socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
//                         })
//                         .catch(e => console.log(e))
//                 })
//             }
//         })
//     }

//     let getUserMedia = () => {
//         if ((video && videoAvailable) || (audio && audioAvailable)) {
//             navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
//                 .then(getUserMediaSuccess)
//                 .then((stream) => { })
//                 .catch((e) => console.log(e))
//         } else {
//             try {
//                 let tracks = localVideoref.current.srcObject.getTracks()
//                 tracks.forEach(track => track.stop())
//             } catch (e) { }
//         }
//     }





//     let getDislayMediaSuccess = (stream) => {
//         console.log("HERE")
//         try {
//             window.localStream.getTracks().forEach(track => track.stop())
//         } catch (e) { console.log(e) }

//         window.localStream = stream
//         localVideoref.current.srcObject = stream

//         for (let id in connections) {
//             if (id === socketIdRef.current) continue

//             connections[id].addStream(window.localStream)

//             connections[id].createOffer().then((description) => {
//                 connections[id].setLocalDescription(description)
//                     .then(() => {
//                         socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
//                     })
//                     .catch(e => console.log(e))
//             })
//         }

//         stream.getTracks().forEach(track => track.onended = () => {
//             setScreen(false)

//             try {
//                 let tracks = localVideoref.current.srcObject.getTracks()
//                 tracks.forEach(track => track.stop())
//             } catch (e) { console.log(e) }

//             let blackSilence = (...args) => new MediaStream([black(...args), silence()])
//             window.localStream = blackSilence()
//             localVideoref.current.srcObject = window.localStream

//             getUserMedia()

//         })
//     }

//     let gotMessageFromServer = (fromId, message) => {
//         var signal = JSON.parse(message)

//         if (fromId !== socketIdRef.current) {
//             if (signal.sdp) {
//                 connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
//                     if (signal.sdp.type === 'offer') {
//                         connections[fromId].createAnswer().then((description) => {
//                             connections[fromId].setLocalDescription(description).then(() => {
//                                 socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
//                             }).catch(e => console.log(e))
//                         }).catch(e => console.log(e))
//                     }
//                 }).catch(e => console.log(e))
//             }

//             if (signal.ice) {
//                 connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
//             }
//         }
//     }




//     let connectToSocketServer = () => {
//         socketRef.current = io.connect(server_url, { secure: false })

//         socketRef.current.on('signal', gotMessageFromServer)

//         socketRef.current.on('connect', () => {
//             socketRef.current.emit('join-call', window.location.href)
//             socketIdRef.current = socketRef.current.id

//             socketRef.current.on('chat-message', addMessage)

//             socketRef.current.on('user-left', (id) => {
//                 setVideos((videos) => videos.filter((video) => video.socketId !== id))
//             })

//             socketRef.current.on('user-joined', (id, clients) => {
//                 clients.forEach((socketListId) => {

//                     connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
//                     // Wait for their ice candidate       
//                     connections[socketListId].onicecandidate = function (event) {
//                         if (event.candidate != null) {
//                             socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
//                         }
//                     }

//                     // Wait for their video stream
//                     connections[socketListId].onaddstream = (event) => {
//                         console.log("BEFORE:", videoRef.current);
//                         console.log("FINDING ID: ", socketListId);

//                         let videoExists = videoRef.current.find(video => video.socketId === socketListId);

//                         if (videoExists) {
//                             console.log("FOUND EXISTING");

//                             // Update the stream of the existing video
//                             setVideos(videos => {
//                                 const updatedVideos = videos.map(video =>
//                                     video.socketId === socketListId ? { ...video, stream: event.stream } : video
//                                 );
//                                 videoRef.current = updatedVideos;
//                                 return updatedVideos;
//                             });
//                         } else {
//                             // Create a new video
//                             console.log("CREATING NEW");
//                             let newVideo = {
//                                 socketId: socketListId,
//                                 stream: event.stream,
//                                 autoplay: true,
//                                 playsinline: true
//                             };

//                             setVideos(videos => {
//                                 const updatedVideos = [...videos, newVideo];
//                                 videoRef.current = updatedVideos;
//                                 return updatedVideos;
//                             });
//                         }
//                     };


//                     // Add the local video stream
//                     if (window.localStream !== undefined && window.localStream !== null) {
//                         connections[socketListId].addStream(window.localStream)
//                     } else {
//                         let blackSilence = (...args) => new MediaStream([black(...args), silence()])
//                         window.localStream = blackSilence()
//                         connections[socketListId].addStream(window.localStream)
//                     }
//                 })

//                 if (id === socketIdRef.current) {
//                     for (let id2 in connections) {
//                         if (id2 === socketIdRef.current) continue

//                         try {
//                             connections[id2].addStream(window.localStream)
//                         } catch (e) { }

//                         connections[id2].createOffer().then((description) => {
//                             connections[id2].setLocalDescription(description)
//                                 .then(() => {
//                                     socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
//                                 })
//                                 .catch(e => console.log(e))
//                         })
//                     }
//                 }
//             })
//         })
//     }

//     let silence = () => {
//         let ctx = new AudioContext()
//         let oscillator = ctx.createOscillator()
//         let dst = oscillator.connect(ctx.createMediaStreamDestination())
//         oscillator.start()
//         ctx.resume()
//         return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
//     }
//     let black = ({ width = 640, height = 480 } = {}) => {
//         let canvas = Object.assign(document.createElement("canvas"), { width, height })
//         canvas.getContext('2d').fillRect(0, 0, width, height)
//         let stream = canvas.captureStream()
//         return Object.assign(stream.getVideoTracks()[0], { enabled: false })
//     }

//     let handleVideo = () => {
//         setVideo(!video);
//         // getUserMedia();
//     }
//     let handleAudio = () => {
//         setAudio(!audio)
//         // getUserMedia();
//     }

//     useEffect(() => {
//         if (screen !== undefined) {
//             getDislayMedia();
//         }
//     }, [screen])
//     let handleScreen = () => {
//         setScreen(!screen);
//     }

//     let handleEndCall = () => {
//         try {
//             let tracks = localVideoref.current.srcObject.getTracks()
//             tracks.forEach(track => track.stop())
//         } catch (e) { }
//         window.location.href = "/"
//     }

//     let openChat = () => {
//         setModal(true);
//         setNewMessages(0);
//     }
//     let closeChat = () => {
//         setModal(false);
//     }
//     let handleMessage = (e) => {
//         setMessage(e.target.value);
//     }

//     const addMessage = (data, sender, socketIdSender) => {
//         setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: sender, data: data }
//         ]);
//         if (socketIdSender !== socketIdRef.current) {
//             setNewMessages((prevNewMessages) => prevNewMessages + 1);
//         }
//     };



//     let sendMessage = () => {
//         console.log(socketRef.current);
//         socketRef.current.emit('chat-message', message, username)
//         setMessage("");

//         // this.setState({ message: "", sender: username })
//     }

    
//     let connect = () => {
//         setAskForUsername(false);
//         getMedia();
//     }


//     return (
//         <div>

//             {askForUsername === true ?

//                 <div>


//                     <h2>Enter into Lobby </h2>
//                     <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
//                     <Button variant="contained" onClick={connect}>Connect</Button>


//                     <div>
//                         <video ref={localVideoref} autoPlay muted></video>
//                     </div>

//                 </div> :


//                 <div className={styles.meetVideoContainer}>

//                     {showModal ? <div className={styles.chatRoom}>

//                         <div className={styles.chatContainer}>
//                             <h1>Chat</h1>

//                             <div className={styles.chattingDisplay}>

//                                 {messages.length !== 0 ? messages.map((item, index) => {

//                                     console.log(messages)
//                                     return (
//                                         <div style={{ marginBottom: "20px" }} key={index}>
//                                             <p style={{ fontWeight: "bold" }}>{item.sender}</p>
//                                             <p>{item.data}</p>
//                                         </div>
//                                     )
//                                 }) : <p>No Messages Yet</p>}


//                             </div>

//                             <div className={styles.chattingArea}>
//                                 <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter Your chat" variant="outlined" />
//                                 <Button variant='contained' onClick={sendMessage}>Send</Button>
//                             </div>


//                         </div>
//                     </div> : <></>}


//                     <div className={styles.buttonContainers}>
//                         <IconButton onClick={handleVideo} style={{ color: "white" }}>
//                             {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
//                         </IconButton>
//                         <IconButton onClick={handleEndCall} style={{ color: "red" }}>
//                             <CallEndIcon  />
//                         </IconButton>
//                         <IconButton onClick={handleAudio} style={{ color: "white" }}>
//                             {audio === true ? <MicIcon /> : <MicOffIcon />}
//                         </IconButton>

//                         {screenAvailable === true ?
//                             <IconButton onClick={handleScreen} style={{ color: "white" }}>
//                                 {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
//                             </IconButton> : <></>}

//                         <Badge badgeContent={newMessages} max={999} color='orange'>
//                             <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
//                                 <ChatIcon />                        </IconButton>
//                         </Badge>

//                     </div>


//                     <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>

//                     <div className={styles.conferenceView}>
//                         {videos.map((video) => (
//                             <div key={video.socketId}>
//                                 <video

//                                     data-socket={video.socketId}
//                                     ref={ref => {
//                                         if (ref && video.stream) {
//                                             ref.srcObject = video.stream;
//                                         }
//                                     }}
//                                     autoPlay
//                                 >
//                                 </video>
//                             </div>

//                         ))}

//                     </div>

//                 </div>

//             }

//         </div>
//     )
// }
import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/Videomeetcss.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import server from '../environment';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    // TODO
    // if(isChrome() === false) {


    // }

    useEffect(() => {
        console.log("HELLO")
        getPermissions();

    })

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);

        }


    }, [video, audio])
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo(!video);
        // getUserMedia();
    }
    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia();
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };



    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }

    
    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }


    return (
        <div>

            {askForUsername === true ?

                <div>


                    <h2>Enter into Lobby </h2>
                    <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
                    <Button variant="contained" onClick={connect}>Connect</Button>


                    <div>
                        <video ref={localVideoref} autoPlay muted></video>
                    </div>

                </div> :


                <div className={styles.meetVideoContainer}>

                    {showModal ? <div className={styles.chatRoom}>

                        <div className={styles.chatContainer}>
                            <h1>Chat</h1>

                            <div className={styles.chattingDisplay}>

                                {messages.length !== 0 ? messages.map((item, index) => {

                                    console.log(messages)
                                    return (
                                        <div style={{ marginBottom: "20px" }} key={index}>
                                            <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                            <p>{item.data}</p>
                                        </div>
                                    )
                                }) : <p>No Messages Yet</p>}


                            </div>

                            <div className={styles.chattingArea}>
                                <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter Your chat" variant="outlined" />
                                <Button variant='contained' onClick={sendMessage}>Send</Button>
                            </div>


                        </div>
                    </div> : <></>}


                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndIcon  />
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        {screenAvailable === true ?
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton> : <></>}

                        <Badge badgeContent={newMessages} max={999} color='orange'>
                            <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
                                <ChatIcon />                        </IconButton>
                        </Badge>

                    </div>


                    <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>

                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                            <div key={video.socketId}>
                                <video

                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                >
                                </video>
                            </div>

                        ))}

                    </div>

                </div>

            }

        </div>
    )
}