import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {Subject, Observable} from 'rxjs';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-live-session-video',
  templateUrl: './live-session-video.component.html',
  styleUrls: ['./live-session-video.component.scss']
})

export class LiveSessionVideoComponent {

  public socket: any;
  existingCalls = [];
  connections = [];
  remoteConnections = [];
  peerConnection: RTCPeerConnection;
  index = 1;
  users: any[] = [];
  socketId = '';
  message = '';
  messages: string[] = [];
  currentSelected = '';
  firstName = '';

  constructor() {
    //this.socket = io('https://www.csi-event.com:5000');

    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302'}]}

    this.peerConnection = new RTCPeerConnection(configuration);

    this.firstName = localStorage.getItem('firstName');
    this.socket.on('send-socket-id', (id: string) => {
      this.socketId = id;
      this.currentSelected = id;
    });

    this.socket.on('update-user-list', (users) => {
      this.users = users;
    });

    this.socket.on('receive-message', (data) => this.messages.push(data));

    this.socket.on('call-made', async data => {

      console.log('in call made: ' + this.socketId);
      console.log(data);

      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(new RTCSessionDescription(answer));

      this.socket.emit('make-answer', {
        answer,
        to: data.socket
      });
    });

    this.socket.on('answer-made', async data => {
      console.log('answer-made:' + this.socketId);
      console.log(data);

      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
      console.log('connection:' + data.socket);
      console.log(this.peerConnection);

    });

    this.socket.on('ice-candidate', async data => {
        await this.peerConnection.addIceCandidate(data.candidate);
    });

    this.peerConnection.ontrack = ({streams:[stream]}) => {
      console.log('stream:', stream);
      const remoteVideo = document.getElementById('remote-video-1') as HTMLVideoElement;
      if (remoteVideo) {
        remoteVideo.srcObject = stream;
      }
    };

    // Listen for local ICE candidates on the local RTCPeerConnection
    this.peerConnection.addEventListener('icecandidate', event => {
      if (event.candidate) {
        this.socket.emit('new-ice-candidate', { to: this.socketId, candidate: event.candidate });
      }
    });

    this.peerConnection.addEventListener('connectionstatechange', event => {
      if (this.peerConnection.connectionState === 'connected') {
        console.log('peers connected');
      }
    });

    const constraints = {audio: false, video: {width: 400, height: 300}};

    navigator.mediaDevices.getUserMedia(constraints)
      .then(mediaStream => {
        const localVideo = document.getElementById('local-video') as HTMLVideoElement;
        if (localVideo) {
          localVideo.srcObject = mediaStream;
        }
        mediaStream.getTracks().forEach(track => this.peerConnection.addTrack(track, mediaStream));

      });

  }

  sendMessage(): void {
    this.socket.emit('send-message', {sender: this.socketId, message: this.message});
  }

  async callUser(socketId): Promise<any> {

    console.log('in call user: ' + this.socketId);

    this.currentSelected = socketId;

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(new RTCSessionDescription(offer));

    this.socket.emit('call-user', {
      offer,
      to: socketId
    });
  }


}
