import React from 'react';
import Form from 'react-bootstrap/Form'
import Select from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import {Link,Redirect} from 'react-router-dom'
import axios from 'axios';
import io from 'socket.io-client';
class Connect extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            rooms: [],
            selectRoom: '',
            adminName:'',
            room:'',
            error: ''

        };
        this.socket =  io('localhost:4000');
        this.toChat = this.toChat.bind(this);
        this.Handler = this.Handler.bind(this);

    }

    //check how to make react and socket io work together
    componentDidMount(){
        this.socket.on('getRooms',({rooms}) =>{
            console.log(rooms)
            if(  rooms.length > 0 ){
                this.setState({rooms:rooms}); 
             }
             else{
                 this.setState({rooms: ['No room available']});
             }
        });
    }

    toChat(e){
        e.preventDefault();
    }

    Handler(e){
        this.setState({[e.target.name]: e.target.value.replace(/\s+/, "") })
    }

    // async checkUser(){
    //     let username = this.state.username;
    //     let room = this.state.selectRoom;
    //     if(this.state.username === '' || this.state.selectRoom === '' ){
    //         this.setState({error:'Choose a username and a room'})
    //         console.log(this.state.error)
    //     }else{
    //         let aaxios
    //         .post('http://localhost:4000/username',{username,room})
    //         .then(response => {
    //             if(response.data.error){
    //                 this.setState({error:response.data.error})
    //             }
    //             if(this.state.error != ''){
    //                 this.props.history.push(`/irc?room=${this.state.selectRoom}&username=${this.state.username}`)
    //             }
    //         })
    //     }
   
    // }

    // async emit(event, data) {
    //     return new Promise((resolve, reject) => {
    //         let username = this.state.username;
    //         let room = this.state.selectRoom;
    //         this.socket.emit('checkUsername',{username,room}, ({error}) => {
    //             this.setState({error:error})
    //             resolve(error);
    //         });
            
    //     });
    // }

    render(){
        return(
        <div style={{
            position: 'absolute',
            top:'10%',
            left:'40%'
        }}>
            <div > 
            <h1>Connect to a room</h1>
                <Form onSubmit={this.toChat}>
                    <Form.Group >
                        <Form.Label>username</Form.Label>
                        <Form.Control type="text" placeholder="Enter a username" name='username'  onChange={this.Handler}/>
                    </Form.Group>

                    <Form.Group >
                       
                        <Form.Control as="select" name="selectRoom" onChange={this.Handler}  multiple>
                        {this.state.rooms.map(id =>
                            <option key={id} value={id}>{id}</option>
                        )}
                        </Form.Control>
                                    
                    </Form.Group>
                        <Link onClick={e => (this.state.username === '' || this.state.selectRoom === '' ) ? e.preventDefault() : null } to={`/irc?room=${this.state.selectRoom}&username=${this.state.username}`} >
                            <Button className='justify-content-center'>
                            Chat !
                        </Button>
                        </Link>
    
                </Form>
            </div>
            <div> 
                <h1>Create a room</h1>
                <Form onSubmit={this.toChat}>
                    <Form.Group >
                        <Form.Label>Room name</Form.Label>
                        <Form.Control type="text" placeholder="Enter a room name" name='room'  onChange={this.Handler}/>
                    </Form.Group>
                   
                    <Form.Group >
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" placeholder="Enter a room name" name='adminName'  onChange={this.Handler}/>
                    </Form.Group>

                        <Link onClick={e => (this.state.room === '' || this.state.adminName === '' ) ? e.preventDefault() : null } to={`/irc?createRoom=${this.state.room}&username=${this.state.adminName}`} >
                            <Button className='justify-content-center'>
                            Create !
                        </Button>
                        </Link>
            
                </Form>
            </div>
        </div>
  
        )
    }
}

export default Connect;