import React, {useState} from 'react';
import { authentication } from '../base';
import {createUserWithEmailAndPassword, getAuth, signOut} from "firebase/auth";


function SignOut(){


    const auth = getAuth();
    signOut(auth).then(() => {

    }).catch((error) => {
        console.log(error.message)
    });



    return(
        <main>
            <div className="ml-5">
                <h3 className="text-yellow-50 font-extrabold text-lg">Wylogowano!</h3>
            </div>
        </main>
    )
}
export default SignOut;