import React, { Component } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import './App.css'

class App extends Component {
  constructor(props) {
    super(props);
    this.statusSchame = [
      'CONNECTING',
      'OPEN',
      'CLOSING',
      'CLOSED'
    ]
    // Don't do this!
    this.state = { 
      msgs: [
        {
          id: 1,
          text: 'hello h2o',
          from: 'default'
        }
      ],
      status: 'READING'
    };
  }

  componentDidMount(){
    this.wsInit();
  }

  rdmMsg(){
    return Math.random().toString(36).replace('0.','')+Date.now().toString(36);
  }

  getStatus(idx){
    return this.statusSchame[idx]
  }

  wsInit(){
    var conn = new ReconnectingWebSocket('ws://127.0.0.1:8889/ws', null, {debug: false, reconnectInterval: 3000});
    this.setState({
      status: this.getStatus(conn.readyState)
    })
    conn.onopen = (event)=>{
      this.setState({
        status: this.getStatus(conn.readyState)
      })
      setInterval(()=>{
        const m = {
          id: this.rdmMsg(),
          text: this.rdmMsg(),
          from: 'interval'
        };
        this.setState(prevState => ({
          msgs: [...prevState.msgs, m]
        }))
        conn.send(JSON.stringify(m))
      }, 5000)
    }
    conn.onmessage = (msg)=>{
      // console.log(msg.data)
      const msgObj = JSON.parse(msg.data);
      // msgObj.id= this.rdmMsg();
      // msgObj.from = 'server';
      this.setState(prevState => ({
        msgs: [...prevState.msgs, msgObj]
      }))
    }
    conn.onclose = ()=>{
      // console.log(msg.data)
      this.setState({
        status: this.getStatus(conn.readyState)
      })
    }
    conn.onerror = ()=>{
      // console.log(msg.data)
      this.setState({
        status: this.getStatus(conn.readyState)
      })
    }
  }

  msgs(msgs){
    const msgc = [];
    msgs.forEach(msg => {
      msgc.push(
        <div key={msg.id}>
          <p>{msg.from}: {msg.text}</p>
          <hr/>
        </div>
      )
    })
    return msgc;
  }
  render() {
    return (
      <div className="App">
      <div id="status">{this.state.status}</div>
          {
            this.msgs(this.state.msgs)
          }
      </div>
    );
  }
}

export default App;
