import { Fragment } from 'react'
import React, {Component} from "react";
import NavBar from "./components/NavBar";
import {Route, Routes} from "react-router-dom";
import Opoznienia from "./components/Opoznienia";
import AppBilet from "./components/AppBilet";
import SignIn from './components/SignIn';
import Profile from './components/Profile'
import SignUp from './components/SignUp'
import SignOut from './components/SignOut'
import RozkladJazdy from "./components/RozkladJazdy";
import ChangeName from "./components/ChangeName";
import ChangePass from "./components/ChangePass";
import ForgotPass from "./components/ForgotPass";
import ResetPass from "./components/ResetPass";
import ChangeImage from "./components/ChangeImage";
import 'react-toastify/dist/ReactToastify.css';
import {ToastContainer} from "react-toastify";
import DevProposal from "./components/devProposal";

class App extends Component {
    render(){
        return(
            <div className="App">
                <ToastContainer
                    position="top-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
                <NavBar/>
                <Routes>
                    <Route exact path="/" element={<Opoznienia />}/>
                    <Route path="/bilet" element={<AppBilet />}/>
                    <Route path="/signin" element={<SignIn />}/>
                    <Route path="/signup" element={<SignUp />}/>
                    <Route path="/profile" element={<Profile />}/>
                    <Route path="/signout" element={<SignOut />}/>
                    <Route path="/rozklad" element={<RozkladJazdy />}/>
                    <Route path="/changename" element={<ChangeName />}/>
                    <Route path="/changepass" element={<ChangePass />}/>
                    <Route path="/forgotpass" element={<ForgotPass />}/>
                    <Route path="/resetpass" element={<ResetPass />}/>
                    <Route path="/changeimage" element={<ChangeImage />}/>
                    <Route path="/devproposal" element={<DevProposal />}/>
                </Routes>
            </div>

        );
    }
}

export default App;
