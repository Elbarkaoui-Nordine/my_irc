const users = [];
const rooms = [];

const getAllRooms = () => {
  return rooms;
}

const addUser = ({ id, username, room , owner }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();


  if(owner){
    if(rooms.find(element => element.room === room)){
      return {error:'Room name already taken'}
    }
    else{
      let date = new Date();
      let limitDate = new Date(date.getTime() + 60*60000);
      rooms.push({room:room, owner:id, limitDate:limitDate});
    }
    
  }
  else if(!rooms.find(element => element.room === room)){
    return {error:'This room dosent exist'}
    console.log(rooms);
  }
  
  const existingUser = users.find((user) => user.room === room && user.username === username);

  if(!username || !room) return { error: 'Username and room are required.' };
  if(existingUser) return { error: 'Username is taken.' };

  const user = { id, username, room };

  users.push(user);

  return { user };
}

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if(index !== -1) return users.splice(index, 1)[0];
}

const removeRoom = (roomFind) => {
  const index = rooms.findIndex((room) => room.room === roomFind);
  if(index !== -1) return rooms.splice(index, 1)[0];
}

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

const changeUsername = ({id, username}) => {
  let Index = users.findIndex((user) => user.id === id);
  users[Index].username = username;
}

const setLastMessage = ({room}) => {

  for( let i = 0 ; i < rooms.length; i++){
    if(rooms[i].room == room){
      let date = new Date();
      let limitDate = new Date(date.getTime() + 60*60000);
      rooms[i].limitDate = limitDate
    }
  }
}


module.exports = { addUser, removeUser, getUser, getUsersInRoom, changeUsername , removeRoom, getAllRooms, setLastMessage};