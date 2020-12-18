import React, { Component } from 'react';
import Navigation from './components/navigation/Navigation';
import Signin from './components/signin/Signin';
import Register from './components/register/Register';
import FaceRecognition from './components/facerecognition/FaceRecognition';
import Logo from './components/logo/Logo';
import ImageLinkForm from './components/imagelinkform/ImageLinkForm';
import Rank from './components/rank/Rank';
import Particles from 'react-particles-js';
import './App.css';

const particleOptions = {
	particles: {
       number: {
       	 value:80,
       	 density: {
       	   enable:true,
       	   value_area: 500
       	 }
       }
    }
}

const initialState = {
      input: '',
      imageURL:'',
      box:{},
      route: 'signin',
      isSignedIn: false,
      user:{
        id:'',
        name: '',
        email: '',
        entries: 0,
        joined:''
      }
}
       
class App extends Component {
	constructor() {
		super();
		this.state = {
			input: '',
			imageURL:'',
			box:{},
			route: 'signin',
			isSignedIn: false,
      user:{
        id:'',
        name: '',
        email: '',
        entries: 0,
        joined:''
      }
		}
	}

loadUser = (data) => {
  this.setState({
    user:{
      id:data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }
  })
}
  
  calculateFaceLocation = (data) => {
  	const clarifaiface = data.outputs[0].data.regions[0].region_info.bounding_box;
  	const image = document.getElementById('inputimage');
  	const width = Number(image.width);
  	const height = Number(image.height);
  	return {
  		leftCol: clarifaiface.left_col * width,
  		topRow: clarifaiface.top_row * height,
  		rightCol: width - (clarifaiface.right_col * width),
  		bottomRow:height - (clarifaiface.bottom_row * height)
  	}
  }

  displayFaceBox = (box) => {
  	this.setState({box: box})
  }

  onInputchange = (event) => {
  	this.setState({
  		input: event.target.value
  	})
  }

  onButtonSubmit = () => {
  	this.setState({imageURL:this.state.input})
  	  fetch('https://vast-sands-42855.herokuapp.com//imageurl', {
        method:'post',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          input:this.state.input
        })
      })
      .then(response => response.json())
  		.then(response => {
        if(response){
          fetch('https://vast-sands-42855.herokuapp.com//image', {
            method:'put',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
            id:this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, {entries:count}))
          })
          .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
  		.catch(err => console.log())
 }
 onRouteChange = (route) => {
 	if(route === 'signout'){
 		this.setState(initialState)
 	}else if (route === 'home'){
 		this.setState({isSignedIn: true})
 	}
 	this.setState({route: route})
 }
  render(){
  	const { isSignedIn, imageURL, route, box } = this.state;
    return (
      <div className="App">
      	 <Particles className='particles'
            params={particleOptions} 
         />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { this.state.route === 'home'
        ? <div>
        	<Logo />
        	<Rank name={this.state.user.name} entries={this.state.user.entries}/>
        	<ImageLinkForm 
        	  onButtonSubmit = {this.onButtonSubmit} 
        	  onInputchange = {this.onInputchange}
        	/>
        	<FaceRecognition box={box} imageURL={imageURL}/>
          </div>
        : (
        	route === 'signin'
        	? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        	: <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          )
    }

      </div>
    );
  }
 
}

export default App;
