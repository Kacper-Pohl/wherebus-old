import React, {useState} from 'react';
import { authentication } from '../base';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import {toast} from "react-toastify";


function SignUp(){

    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword,setRegisterPassword] = useState("");
    var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$/;

    const register = async () => {
        var pass = document.getElementById("pass").value;
        var confirm_pass = document.getElementById("confirm_pass").value;
        if(pass.match(passw)) {
            if(pass === confirm_pass) {
                try {
                    const auth = getAuth();
                    createUserWithEmailAndPassword(auth, registerEmail, registerPassword)
                        .then((userCredential) => {
                            // Signed in
                            sendEmailVerification(auth.currentUser)
                                .then(() => {
                                    // Email verification sent!
                                    // ...
                                    auth.signOut();
                                    toast.info("Na twój adres e-mail wysłano link do weryfikacji konta!");
                                    window.location.pathname = "/signin";
                            });
                        })
                        .catch((error) => {
                            const errorCode = error.code;
                            const errorMessage = error.message;
                            toast.error(error.message);
                            // ..
                        });
                } catch (error) {
                    console.log(error.message);
                    toast.error(error.message);
                }
            } else {
                toast.error("Hasła się nie zgadzają!");
            }
        } else {
            toast.error("Niepoprawne hasło!");
        }
    };

    function sprawdzenieZasad(){
        let haslo = document.getElementById("pass").value;
        let hasloPowtorz = document.getElementById("confirm_pass").value;
        let nazwaLength = haslo.length;
        if(haslo !== hasloPowtorz){
            document.getElementById("hasla").className = "block text-red-700 text-sm font-bold mb-2";
        } else {
            document.getElementById("hasla").className = "block text-green-700 text-sm font-bold mb-2";
        }
        if(nazwaLength > 7){
            if(nazwaLength < 33){
                document.getElementById("minZnak").className = "block text-green-700 text-sm font-bold mb-2";
            } else {
                document.getElementById("minZnak").className = "block text-red-700 text-sm font-bold mb-2";
            }
        } else {
            document.getElementById("minZnak").className = "block text-red-700 text-sm font-bold mb-2";
        }
        if(haslo.match(/^(?=.*[a-z]).{1,}$/)){
            document.getElementById("malaLit").className = "block text-green-700 text-sm font-bold mb-2";
        } else {
            document.getElementById("malaLit").className = "block text-red-700 text-sm font-bold mb-2";
        }
        if(haslo.match(/^(?=.*[A-Z]).{1,}$/)){
            document.getElementById("duzaLit").className = "block text-green-700 text-sm font-bold mb-2";
        } else {
            document.getElementById("duzaLit").className = "block text-red-700 text-sm font-bold mb-2";
        }
        if(haslo.match(/^(?=.*\d).{1,}$/)){
            document.getElementById("cyfra").className = "block text-green-700 text-sm font-bold mb-2";
        } else {
            document.getElementById("cyfra").className = "block text-red-700 text-sm font-bold mb-2";
        }
    }


    return(
        <main className="mt-20">
            <div className='flex max-w-sm w-full bg-white shadow-md rounded-lg overflow-hidden mx-auto'>
                <div className='w-2 bg-gray-800'></div>

                <div className='flex items-center px-2 py-3'>
                    <div className="w-full max-w-xs">
                        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Email
                                </label>
                                <input id="mail" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Email..." onChange={(event)=>{setRegisterEmail(event.target.value)}}/><br/>
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Password
                                </label>
                                <input id="pass" type="password" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Password..." onChange={ (event)=> { setRegisterPassword(event.target.value) ; sprawdzenieZasad()}} /><br/>
                                <input id="confirm_pass" type="password" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2" placeholder="Repeat Password..." onChange={sprawdzenieZasad} /><br/>
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Wymagania hasła:
                                </label>
                                <label className={"block text-red-700 text-sm font-bold mb-2"} id="minZnak">
                                    · 8-32 znaków
                                </label>
                                <label className="block text-red-700 text-sm font-bold mb-2" id="malaLit">
                                    · Mała litera
                                </label>
                                <label className="block text-red-700 text-sm font-bold mb-2" id="duzaLit">
                                    · Duża litera
                                </label>
                                <label className="block text-red-700 text-sm font-bold mb-2" id="cyfra">
                                    · Cyfra
                                </label>
                                <label className="block text-green-700 text-sm font-bold mb-2" id="hasla">
                                    · Hasła się zgadzają
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <button onClick={register} className="ml-5 mt-5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">Utwórz konto</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    )
}
export default SignUp;