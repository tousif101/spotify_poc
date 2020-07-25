import React, { Component } from 'react';
import './App.css';
import Search from './Component/Search/Search';

class App extends Component { 
  constructor(){
    super();
    const params = this.getHashParams();
    const token = params.access_token;

    this.state = {token: token};


    console.log(params);
  }

  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
       e = r.exec(q);
    }
    return hashParams;
  }

  render() {
    return (
      <div className='App'>
        {
          this.state.token ? 
          <Search token={this.state.token} /> :
          <a href='http://localhost:8888'> Login to Spotify</a>
        }
      </div>
    )
  }
}

export default App;
