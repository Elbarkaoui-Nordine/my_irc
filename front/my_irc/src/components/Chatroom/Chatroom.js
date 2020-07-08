import React from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import {location} from 'react-router-dom'
import queryString from 'query-string';
import io from 'socket.io-client';
import axios from 'axios';
import Message from './Message';

import './style.css';
class Chatroom extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            room: '',
            users: [],
            error:'',
            owner:false,
            children:[]
        };
        this.socket =  io('localhost:4000');
        this.Handler = this.Handler.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.changeUsername = this.changeUsername.bind(this);
        this.deleteRoom = this.deleteRoom.bind(this);
    }

    //check how to make react and socket io work together
    componentDidMount(){

        //counter dans le front qui a chaque ON message reset le timer si le timer atteint la fin delete la room
    
        const { username , room, createRoom } = queryString.parse(this.props.location.search);

  
        
        if(createRoom && username){
            let owner = true;
            this.socket.emit('join',{username,room:createRoom,owner}, ({error}) =>{
                this.setState({error:error});
            });
            if(this.state.error == ''){
                this.setState({owner: true});
            }
            //check if 
        }
        else if(username && room){
            this.socket.emit('join',{username,room}, ({error}) =>{
                this.setState({error:error});
            });
        }
        else{
            this.setState({error:'This page dosent exist'});
        }

        this.socket.on('message',({username , message}) => {
            let tmpMessage = username ?  username+' : '+message : message; 
            if(!this.state.error && document.getElementById('box') !== null ){
                this.setState({
                    children:[...this.state.children,tmpMessage ],
                })
            }
            var objDiv = document.getElementById("divBox");
            objDiv.scrollTop = objDiv.scrollHeight;
        })

        this.socket.on('users list',((users) => {
            this.setState({users:users});
        }))

        this.socket.on('redirection',({link}) => {
            this.props.history.push(link);
                window.location.reload();
        })
    }
    
    

    Handler(e){
        this.setState({[e.target.name]: e.target.value})
    }

    sendMessage(e){
        e.preventDefault();
        let message = document.getElementById('message').value.trim().replace(/\s+/g, " ");
        let splitMsg = message.split(' ');
        if(splitMsg.length > 2 && message.startsWith('/')){
            if(splitMsg[0] == '/msg'){

                let receiver = splitMsg[1];
                splitMsg.splice(0,2);
                let message = splitMsg.join(' ');

                this.socket.emit('whisper',{receiver,message}, ({error}) =>{
                    let messages = this.state.children;
                    messages.push(error);
                    this.setState({children:messages})
                });
            }
        }
        else if(splitMsg.length == 2 && message.startsWith('/')){
                switch (splitMsg[0]) {
                    case '/nick':
                        this.changeUsername(splitMsg[1]);
                      break;
                    case '/list':
                        this.socket.emit('getRegexList',splitMsg[1], (result) =>{
                            let messages = this.state.children;
                            messages.push('List of the rooms on the server for this string :');
                            for( let i = 0 ; i < result.length ; i++){
                                result[i].room ? messages.push(result[i].room) : messages.push(result[i]);
                            }
                            this.setState({children:messages})
                        });
                        break;
                    case '/create':
                        this.socket.emit('checkRoom',splitMsg[1], ({error}) =>{
                            if(error){
                                let messages = this.state.children;
                                messages.push(error);
                                this.setState({children:messages})
                            }
                        });
                        break;
                    case '/join':
                        this.socket.emit('joinRoom',splitMsg[1], ({error}) =>{
                            if(error){
                                let messages = this.state.children;
                                messages.push(error);
                                this.setState({children:messages})
                            }
                        });
                        break;
                    default:
                      alert(`commande inconnue`);   
                  }
        }
        else if(message.startsWith('/')){
            switch (message) {
                case '/users':
                    let messages = this.state.children;
                    messages.push('List of the users in this room :');
                    for( let i = 0 ; i < this.state.users.length ; i++){
                        messages.push(this.state.users[i].username);
                    }
                    this.setState({children:messages})
                  break;
                case '/list':
                    this.socket.emit('getAllRooms',{}, ({result}) =>{
                        let messages = this.state.children;
                        messages.push('List of the rooms on the server :');
                        for( let i = 0 ; i < result.length ; i++){
                            messages.push(result[i].room);
                        }
                        this.setState({children:messages})
                    });
                    break;
                case '/delete':
                   if(this.state.owner){
                       this.deleteRoom();
                   }
                    break;
                case '/part':
                    this.props.history.push('/');
                    window.location.reload();
                   break;
                default:
                    alert(`commande inconnue`); 
            }
        }
        else if(message != ''){
            this.socket.emit('sendMessage',message,({error}) => {
                this.setState({error:error});
            });
        }
        document.getElementById('message').value = '';
    }

    changeUsername(username){
            
        const found = this.state.users.find(user => user.username === username);

        if(found){
            alert('Username already taken in this room');
        }
        else{
            this.socket.emit('Change username',username);
        }
    }

    deleteRoom(){
            this.socket.emit('deleteRoom',{},({error}) => {
                this.setState({error:error});
            });
    }

    render(){
        if(this.state.error){
            return (<h1>{this.state.error}</h1>)
        }
        return(
        <div > 
            <div className='d-flex flex-row'> 
                <ul className='w-20 p-1 list-group scroll'>
                    
                    {this.state.users.map( (user,i) => {
                        return (
                        <li key={i} className="list-group-item">{user.username}</li>
                        )
                    })}
                </ul>
        
                <div id="divBox" className='w-100 p-3 border border-primary' style={{
                    minHeight:'400px',
                    maxHeight:'400px',
                    overflow:'scroll'
                }}>
                    <ul id='box' style={{
                        listStyleType:'none',
                        paddingLeft:'0',
                    }}
                    >
                    {this.state.children.map((child,i) => i%2 == 0 ? <Message key={i} message={child} background='#6D7B8D' color='white'  /> : <Message key={i} message={child} />)}

                    </ul>

                </div>
            </div>
            <Form onSubmit={this.sendMessage}>
                <Form.Group >
                    <label>Send a message</label> <Form.Control type="text" placeholder="Send a message"  id='message' name='message'  onChange={this.Handler}/>
                    </Form.Group>

                    <Button type='sumbit' className='m-2 justify-content-center'>
                        Submit
                    </Button>
                    <Button onClick={() => {
                        let username = prompt('What is your new username');
    
                        this.changeUsername(username);
                        }} variant="outline-secondary  justify-content-end">
                        Change username
                    </Button>
                    {this.state.owner ?  <Button onClick={this.deleteRoom} className='m-2 justify-content-center'>
                        Delete room
                    </Button> : null}
            </Form>
          
          
        </div>
        )
    }
}


export default Chatroom;