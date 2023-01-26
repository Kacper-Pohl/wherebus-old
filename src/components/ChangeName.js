import React, {useState} from 'react';
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import {toast} from "react-toastify";



function ChangeName(){

    const auth = getAuth();
    let [user, setUser] = useState({});
    onAuthStateChanged(auth,(currentUser)=>{
        setUser(currentUser);
    })
    user = auth.currentUser;
    function zmianaNazwy(){
        const auth = getAuth();
        user = auth.currentUser;
        let nowaNazwa = document.getElementById("username").value; //Naprawiłem żeby przechodziło na profil (usunięcie forms)
        let nazwaLength = nowaNazwa.length;
        if(!nowaNazwa.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)) {  //Sprawdzenie znaku specjalnego
            if (nazwaLength >= 4) {  //Sprawdzanie długości
                if (nazwaLength < 21) {
                    if (user !== null) {  //Sprawdzanie czy jest jakiś user
                        if(auth.currentUser.displayName != nowaNazwa)
                        {
                            try {
                                updateProfile(auth.currentUser, {
                                    displayName: nowaNazwa  //jak tutaj dać wartość w "" to przechodzi normalnie, inaczej idzie do catch'a, ale i tak działa
                                }).then(() => {
                                    window.location.pathname = "/profile";
                                    toast.success("Udało zmienić się nazwę!")
                                }).catch((error) => {
                                    console.log(error);  //Zawsze przechodzi tutaj, daje jakieś errory, ale i tak zmienia nazwę idk
                                    window.location.pathname = "/profile";
                                    toast.success("Udało zmienić się nazwę!")

                                });
                            } catch {
                                toast.error("Nie udało się zmienić nazwy użytkownika!");
                            }
                        } else {
                            toast.error("Nazwa jest taka sama!");
                        }
                    } else {
                        console.log("No logged in profile detected");
                    }
                } else {
                    toast.error("Nazwa jest zbyt długa!");
                }
            } else {
                toast.error("Nazwa jest zbyt krótka!");
            }
        } else {
            toast.error("Użyto znaku specjalnego!");
        }
    }

    function sprawdzenieZasad(){
        let nowaNazwa = document.getElementById("username").value;
        let nazwaLength = nowaNazwa.length;
        if (nazwaLength >= 4) {
            if(nazwaLength < 21) {
                document.getElementById("minZnak").className = "block text-green-700 text-sm font-bold mb-2";
            } else {
                document.getElementById("minZnak").className = "block text-red-700 text-sm font-bold mb-2";
            }
        } else {
            document.getElementById("minZnak").className = "block text-red-700 text-sm font-bold mb-2";
        }
        if(!nowaNazwa.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)){
            document.getElementById("znakSpec").className = "block text-green-700 text-sm font-bold mb-2";
        } else {
            document.getElementById("znakSpec").className = "block text-red-700 text-sm font-bold mb-2";
        }
    }

    return(
        <main className="grid place-items-center mt-20">
            <div className="w-full max-w-xs bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" id="form">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Obecna nazwa:
                        </label>
                        <label className="block text-gray-700 text-sm mb-2" htmlFor="username">
                            {user?.displayName}
                        </label>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Nowa nazwa:
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="username" type="text" placeholder="Nazwa użytkownika" onChange={sprawdzenieZasad}></input>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Wymagania nazwy:
                        </label>
                        <label className={"block text-red-700 text-sm font-bold mb-2"} id="minZnak">
                            · 4-20 znaków
                        </label>
                        <label className="block text-green-700 text-sm font-bold mb-2" id="znakSpec">
                            · Brak znaków specjalnych(!@#$%^&*()_+\-=\[\]{};':"\\|,.>\/?)
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={zmianaNazwy}>
                            Zmień nazwę
                        </button>
                    </div>
            </div>
        </main>
    )
}
export default ChangeName;