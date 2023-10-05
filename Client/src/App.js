import React, { Component } from "react";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
// import  Clarifai from 'clarifai';
import Design from "./components/Design/Design";
import Navigation from "./components/Navigation/Navigation";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import "./App.css";




class App extends Component {
  constructor() {
    super();
    this.state = {
      input: "",
      imageUrl: "",
      box: {},
      route: 'signin',  
      isSignedIn: false,
      user: {
        id:'',
        name: '',
        email: '',
        entries: 0,
        joined: new Date()
      }
    }
  }

  loadUser=(data) => { 
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    
  }})
  }


 calculateFaceLocation = (data) => {
  if (data && data.outputs && data.outputs[0] && data.outputs[0].data && data.outputs[0].data.regions[0]) {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  } else {
    return {}; 
  }
  }


  displayFaceBox = (box) => {
    this.setState({ box: box });
  };

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

 onButtonSubmit = (event) => {
    console.log("button clicked");
    this.setState({ imageUrl: this.state.input });
    const USER_ID = "clarifai"; //(the code by your name) 
    const PAT = "c43f104f344a4d77b637b4ec8c11f37c"; //(your Clarifai api key)
    const APP_ID = "main"; //(what you named your app in Clarifai)
    const MODEL_ID = "face-detection";
    const MODEL_VERSION_ID = "'6dc7e46bc9124c5c8824be4822abe105'";
    const IMAGE_URL = "https://samples.clarifai.com/metro-north.jpg";
    const raw = JSON.stringify({
      user_app_id: {
        user_id: USER_ID,
        app_id: APP_ID,
      },
      inputs: [{ data: { image: { url: IMAGE_URL } } }],
    });

    const requestOptions = {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Key " + PAT,
      },
      body: raw,
    };
    fetch(
      "https://api.clarifai.com/v2/models/" +
      + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions
    )
      .then((response) => response.text())
      .then((response) => {
        const parser = JSON.parse(response);
        console.log(
          "hi",
          parser.outputs[0].data.regions[0].region_info.bounding_box
        );
        // console.log(response[])
        if (response) {
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json'}, 
            body: JSON.stringify({
              id: this.state.user.id
              })
          })
            .then(response => response.json())
            .then((count) => {
              this.setState(Object.assign(this.state.user,{entries:count}))
              })
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err=>console.log(err));
  }


  

  onRouteChange = (route) => {
    if (route === "signout") {
      this.setState({ isSignedIn: false });
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <div className="particles">
          <Design />
        </div>

        <Navigation
          isSignedIn={isSignedIn}
          onRouteChange={this.onRouteChange}
        />
        {route === "home" 
         ? <div>
            <Logo />
            <Rank />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
          : (
        route === 'signin'
         ? <Signin onRouteChange={this.onRouteChange} />
         :<Register  loadUser ={this.loadUser} onRouteChange={this.onRouteChange} />
         )
        }
      </div>
    );
  }
}

export default App;




