import React from 'react';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import {toast} from "react-toastify";



function ForgotPass(){


    function resetHasla(){
        const auth = getAuth();
        let adresMail = document.getElementById("adres").value;
        if(!adresMail.match(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/)) {
            toast.error("Niepoprawny mail!");
        } else {
            try{
                sendPasswordResetEmail(auth, adresMail)
                    .then(() => {
                        toast.info("Wysłano maila!");
                    })
                    .catch((error) => {
                        toast.error("Nie znaleziono maila w bazie!");
                        console.log(error);
                    });
            } catch{
                console.log("Coś poszło nie tak!");
            }
        }
    }


    return(
        <main className="grid place-items-center mt-20">
            <div className="w-full max-w-xs bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" id="form">
                <div className="mb-6 block text-gray-700 text-xl font-bold">
                    <h4>Zapomniałem Hasła</h4>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mail">
                        Adres e-mail:
                    </label>
                    <input id="adres"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                           type="text" placeholder="Wpisz swój adres e-mail...">

                    </input>
                </div>
                <div className="flex items-center justify-between">
                    <button
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={resetHasla}>
                        Wyślij maila
                    </button>
                </div>
            </div>
        </main>
    )
}
export default ForgotPass;