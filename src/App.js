import React, { Component } from 'react';
import './App.css';
import Navigation from './Navigation';
import Logo from './Logo';
import Rank from './Rank';
import ImageLinkForm from './ImageLinkForm';
import ImageDisplay from './ImageDisplay';
import Clarifai from 'clarifai';
import Particles from 'react-particles-js';
import Signin from './Signin';
import Register from './Register'

const app = new Clarifai.App({apiKey: '3745d0a301034ace84c061999c668112'});

class App extends Component {
  constructor()
  {
    super();
    this.state=
    {
      input:'',
      imageUrl:'',
      box: {},
      route:'signin',
      isSignedIn:false,
      user:{
        id:'',
        name:'',
        email:'',
        entries:'0',
        joined:''
      }
    }
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  displayFaceBox = (box) =>{
    console.log(box);
    this.setState({box: box});
  }

  calculateFaceLocation=(info)=>{
    const clarifaiFace = info.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return{
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  onInputChange=(event)=>{
  this.setState({input:event.target.value})
  }

  onSubmit=()=>
  {
    this.setState({imageUrl: this.state.input});
    console.log(this.state.imageUrl);
    app.models
     .predict(
       'a403429f2ddf4b49b307e318f00e528b',
       this.state.input)
     .then(response => {
       if (response) {
         fetch('http://localhost:3000/image', {
           method: 'put',
           headers: {'Content-Type': 'application/json'},
           body: JSON.stringify({
             id: this.state.user.id
           })
         })
           .then(response => response.json())
           .then(count => {
             this.setState(Object.assign(this.state.user, { entries: count}))
           })

       }
       this.displayFaceBox(this.calculateFaceLocation(response))
     })
     .catch(err => console.log(err));


  }

  onRouteChange = (route) => {
   if (route === 'signout') {
     this.setState({isSignedIn: false})
   } else if (route === 'home') {
     this.setState({isSignedIn: true})
   }
   this.setState({route: route});
 }


 render() {
   return (
     <div className="App">
     <Particles className='parti'
     params={{
         particles: {
           number:{
             value:40,
             density:{
               enable:true,
               value_area:800
             }
           },
          move:
          {
            enable:true,
            speed:7
          },

         }
       }}/>
       <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} />
       { this.state.route === 'home'
         ? <div>
             <Logo />
             <Rank name={this.state.user.name} entries={this.state.user.entries}/>
             <ImageLinkForm
               onInputChange={this.onInputChange}
               onSubmit={this.onSubmit}
             />
             <ImageDisplay imageUrl={this.state.imageUrl} box={this.state.box}  />
           </div>
         : (
            this.state.route === 'signin'
            ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
           )
       }
     </div>
   );
 }
}

export default App;
