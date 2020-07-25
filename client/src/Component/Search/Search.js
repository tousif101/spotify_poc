import React, { Component } from 'react';

class Search extends Component { 
    constructor(props){
      super(props);

      this.state = {token:props.token}
    }
    componentDidMount() {
      fetch('http://localhost/search')
      .then(res => res.json())
      .then((data) => {
        this.setState({ contacts: data })
      })
      .catch(console.log)
    }

    render() {
      return (
        <h1></h1>
      )
    }
  }

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