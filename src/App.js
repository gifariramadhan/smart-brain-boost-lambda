import React, { Component } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { particlesOptions } from "./config";
import Navigation from "./components/Navigation/Navigation";
import SignIn from "./components/SignIn/SignIn";
import Register from "./components/Register/Register";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import FaceRecogniion from "./components/FaceRecognition/FaceRecognition";
import Modal from "./components/Modal/Modal";
import Profile from "./components/Profile/Profile";
import "./App.css";

const particlesInit = async (main) => {
    await loadFull(main);
};

const initialState = {
    input: "",
    imageURL: "",
    boxes: [],
    route: "signin",
    isSignedIn: false,
    isProfileOpen: false,
    user: {
        id: "",
        name: "",
        email: "",
        entries: 0,
        joined: "",
        pet: "",
        age: "",
    },
};

class App extends Component {
    constructor() {
        super();
        this.state = initialState;
    }

    componentDidMount() {
        const token = window.sessionStorage.getItem("token");
        if (token) {
            fetch("http://localhost:3000/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data && data.id) {
                        fetch(`http://localhost:3000/profile/${data.id}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: token,
                            },
                        })
                            .then((response) => response.json())
                            .then((user) => {
                                if (user && user.email) {
                                    this.loadUser(user);
                                    this.onRouteChange("home");
                                }
                            });
                    }
                })
                .catch(console.log);
        }
    }

    loadUser = (data) => {
        this.setState({
            user: {
                id: data.id,
                name: data.name,
                email: data.email,
                age: data.age,
                entries: data.entries,
                joined: data.joined,
                pet: data.pet,
            },
        });
    };

    calculateFaceLocations = (data) => {
        if (data && data.outputs) {
            return data.outputs[0].data.regions.map((face) => {
                const clarifaiFace = face.region_info.bounding_box;
                const image = document.getElementById("inputImage");
                const width = Number(image.width);
                const height = Number(image.height);
                return {
                    leftCol: clarifaiFace.left_col * width,
                    topRow: clarifaiFace.top_row * height,
                    rightCol: width - clarifaiFace.right_col * width,
                    bottomRow: height - clarifaiFace.bottom_row * height,
                };
            });
        }
        return;
    };

    displayFaceBoxes = (boxes) => {
        boxes && this.setState({ boxes: boxes });
    };

    onInputChange = (event) => {
        this.setState({ input: event.target.value });
    };

    onButtonSubmit = () => {
        this.setState({ imageURL: this.state.input });
        fetch("http://localhost:3000/imageurl", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: window.sessionStorage.getItem("token"),
            },
            body: JSON.stringify({
                input: this.state.input,
            }),
        })
            .then((response) => response.json())
            .then((response) => {
                if (response) {
                    fetch("http://localhost:3000/image", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization:
                                window.sessionStorage.getItem("token"),
                        },
                        body: JSON.stringify({
                            id: this.state.user.id,
                        }),
                    })
                        .then((response) => response.json())
                        .then((count) => {
                            this.setState(
                                Object.assign(this.state.user, {
                                    entries: count,
                                })
                            );
                        })
                        .catch(console.log);
                }
                this.displayFaceBoxes(this.calculateFaceLocations(response));
            })
            .catch((err) => console.log(err));
    };

    onRouteChange = (route) => {
        route === "home"
            ? this.setState({ isSignedIn: true })
            : this.setState(initialState);
        this.setState({ route: route });
    };

    toggleModal = () => {
        this.setState((prevState) => ({
            isProfileOpen: !prevState.isProfileOpen,
        }));
    };

    render() {
        const { isSignedIn, imageURL, boxes, route, isProfileOpen, user } =
            this.state;
        return (
            <div className="App">
                <Particles
                    className="particles"
                    init={particlesInit}
                    options={particlesOptions}
                />
                <Navigation
                    onRouteChange={this.onRouteChange}
                    isSignedIn={isSignedIn}
                    toggleModal={this.toggleModal}
                />
                {isProfileOpen && (
                    <Modal>
                        <Profile
                            isProfileOpen={isProfileOpen}
                            toggleModal={this.toggleModal}
                            loadUser={this.loadUser}
                            user={user}
                        />
                    </Modal>
                )}
                {route === "home" ? (
                    <>
                        <Logo />
                        <Rank
                            name={this.state.user.name}
                            entries={this.state.user.entries}
                        />
                        <ImageLinkForm
                            onInputChange={this.onInputChange}
                            onButtonSubmit={this.onButtonSubmit}
                        />
                        <FaceRecogniion imageURL={imageURL} boxes={boxes} />
                    </>
                ) : route === "signin" ? (
                    <SignIn
                        loadUser={this.loadUser}
                        onRouteChange={this.onRouteChange}
                    />
                ) : (
                    <Register
                        loadUser={this.loadUser}
                        onRouteChange={this.onRouteChange}
                    />
                )}
            </div>
        );
    }
}

export default App;
