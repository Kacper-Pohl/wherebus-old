import React, {useState} from 'react';
import { authentication } from '../base';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth";
import {toast} from 'react-toastify';



function SignIn (){

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const auth = getAuth();
    const [user, setUser] = useState({});

    const login = async () => {
        try{
            const cUser = await  signInWithEmailAndPassword(
                authentication,
                loginEmail,
                loginPassword
            );
            window.location.pathname = "/profile";
            const auth = getAuth();
            const user = auth.currentUser;
            const emailVerified = user.emailVerified;
            if(!emailVerified){
                toast.info("Zweryfikuj swój adres email!");
                auth.signOut();
                window.location.pathname = "/signin";
            }
            console.log(user)

        }catch (error){
            console.log(error.message);
            toast.error(error.message);
        }
    };

    onAuthStateChanged(auth,(currentUser)=>{
        setUser(currentUser);
    })


    const SignInWithFirebase =()=>{
        const provider = new GoogleAuthProvider();
        signInWithPopup(authentication, provider)
            .then((re)=>{
                console.log(re);
                window.location.pathname = "/profile";
            })
            .catch((err)=>{
                console.log(err);
            })
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
                                <input id="user" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Email..." onChange={(event)=>{setLoginEmail(event.target.value)}}/><br/>
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Password
                                </label>
                                <input id="pass" type="password" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Password..." onChange={(event)=>{setLoginPassword(event.target.value)}}/><br/>
                            </div>
                            <div className="flex items-center justify-between">
                                <a className="inline-block align-baseline font-bold text-sm text-yellow-600 hover:text-yellow-800"
                                   href="/forgotpass">
                                    Zapomniałeś hasła?
                                </a>
                            </div>
                            <div className="flex items-center justify-between">
                                <button onClick={login} className="ml-5 mt-5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">Zaloguj</button>
                                <button onClick={SignInWithFirebase} className="ml-5 mt-5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded" >Google</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </main>


    )
}
export default SignIn