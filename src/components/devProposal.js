import React, {Component} from "react";
import * as emailjs from "@emailjs/browser";
import {toast} from "react-toastify";
import {useAuth} from "../base";
import {getAuth} from "firebase/auth";

class DevProposal extends Component{

    render(){
        function sendMail(){
            const auth = getAuth();
            const user = auth.currentUser;
            if (user !== null) {
                if (document.getElementById("message").value.length < 24) {
                    toast.error("Zbyt krótka wiadomość!");
                } else {
                    if (document.getElementById("message").value.length > 1024) {
                        toast.error("Zbyt długa wiadomość!");
                    } else {
                        let templateParams = {
                            from_mail: user.email,
                            message: document.getElementById("message").value,
                        };
                        emailjs.send('service_x2lpvvj', 'template_qwrnvnb', templateParams, 'gZytIf4_zMLBU_EGi')
                            .then(function (response) {
                                console.log('SUCCESS!', response.status, response.text);
                                toast.success("Wysłano propozycje!", {
                                    onClose: props => window.location.pathname = "/profile",
                                });
                            }, function (error) {
                                console.log('FAILED...', error);
                            });
                    }
                }
            } else {
                toast.error("Nie wykryto zalogowanego użytkownika!");
            }
        }

        function wordCounter(){
            let ileZnakow = document.getElementById("message").value.length;
            if(ileZnakow >= 24 && ileZnakow <= 1024){
                document.getElementById("ileZnk").className = "block mb-4 text-m font-bold text-green-600 dark:text-gray-400";
            } else {
                document.getElementById("ileZnk").className = "block mb-4 text-m font-bold text-red-600 dark:text-gray-400";
            }
            document.getElementById("ileZnk").innerHTML = "Długość tekstu: " + ileZnakow;
        }

        return (
            <main className='grid place-items-center px-8 pt-8 pb-8 mb-20' >
                <div
                    className="w-5/12 h-5/12 mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 px-8 pt-8 pb-8 mb-20">
                    <label htmlFor="message" className="block mb-4 text-xl font-medium text-gray-900 dark:text-gray-400">Wpisz swoją propozycję rozwoju</label>
                    <textarea id="message" rows="4" onChange={wordCounter}
                    className="h-80 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Od 24 do 1024 znaków..."/>
                    <label id="ileZnk" htmlFor="iloscZnakow2" className="block mb-4 text-m font-bold text-red-600 dark:text-gray-400">Długość tekstu: 0</label>
                    <button
                        className="py-2 px-4 bg-yellow-500 hover:bg-yellow-700 text-white font-semibold rounded-lg shadow-md" onClick={sendMail}>
                        Prześlij propozycje
                    </button>
                </div>
            </main>
        )
    }
}

export default DevProposal;