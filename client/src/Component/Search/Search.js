import React, { Component } from 'react';

class Search extends Component { 
    constructor(props){
      super(props);
    
      this.state = {token:props.token}
    }
    componentDidMount() {
      const data = {access_token:this.state.token, search_input:"testing this"};
      console.log(this.state.token)
      const url = `http://localhost:8888?access_token=${encodeURIComponent(data.access_token)}&search_input=${encodeURIComponent(data.search_input)}`
      console.log(url)
      fetch(url, {
        method: 'GET',
        mode: 'no-cors'
      })
      .then(res => res.json())
      .then((data) => {
        console.log(data)
        this.setState({ search: data })
      }).catch(console.log);
    }

    render() {
      return (
      <h1>HI</h1>
      
      )
    }
  }
  /*
fetch(`https://api.parse.com/1/users?foo=${encodeURIComponent(data.foo)}&bar=${encodeURIComponent(data.bar)}`, {
  method: "GET",
  headers: headers,   
})
  */

  /*
   document.getElementById('search-playlists').addEventListener('search', function(){
            var search_input = $(this).val()
            $.ajax({
              url: '/search',
              data:{
                'access_token': access_token,
                'search_input': search_input
              }
            }).done(function(data){
              
            });
          },false);

  */
  
  export default Search;