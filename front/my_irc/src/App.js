import React from 'react';
import Connect from './components/Connect';
import Chatroom from './components/Chatroom/Chatroom';
import './App.css';
import Container from 'react-bootstrap/Container'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
function App() {
  return (
    <Router>
    <Container>
      <Route  exact path='/' component={Connect} />
      <Route exact  path='/irc' component={Chatroom} />
    </Container>
  </Router>
  );
}

export default App;
