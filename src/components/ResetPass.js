import React from 'react';
import {getAuth,  confirmPasswordReset} from "firebase/auth";
import {toast} from "react-toastify";


function ResetPass(){

    function noweHaslo(){
        const auth = getAuth();
        var url = new URL(document.URL);
        const params = url.searchParams;
        const oob = params.get('oobCode')
        let noweHaslo = document.getElementById("newpass").value;
        let noweHasloPowtorz = document.getElementById("newpass2").value;
        let nazwaLength = noweHaslo.length;
        if(noweHaslo !== noweHasloPowtorz) {
            toast.error("Hasła się nie zgadzają!");
        }else {
            if (nazwaLength < 8) {
                toast.error("Hasło jest za krótkie!");
            } else {
                if (nazwaLength > 32) {
                    toast.error("Hasło jest za długie!")
                } else {
                    if (!noweHaslo.match(/^(?=.*[a-z]).{1,}$/)) {
                        toast.error("Brak małej litery");
                    } else {
                        if (!noweHaslo.match(/^(?=.*[A-Z]).{1,}$/)) {
                            toast.error("Brak dużej litery!")
                        } else {
                            if (!noweHaslo.match(/^(?=.*\d).{1,}$/)) {
                                toast.error("Brak cyfry!")
                            } else {
                                try {
                                    confirmPasswordReset(auth, oob, noweHaslo).then(() => {
                                        window.location.pathname = "/signin";
                                        toast.success("Hasło zostało zmienione!")
                                    }).catch((error) => {
                                        toast.success("Udało się zmienić hasło!")
                                        window.location.pathname = '/signin';
                                        console.log(error);
                                    });
                                } catch {
                                    toast.error("Coś poszło nie tak!");
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    function sprawdzenieZasad(){
        let noweHaslo = document.getElementById("newpass").value;
        let noweHasloPowtorz = document.getElementById("newpass2").value;
        let nazwaLength = noweHaslo.length;
        if(noweHaslo !== noweHasloPowtorz){
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
        if(noweHaslo.match(/^(?=.*[a-z]).{1,}$/)){
            document.getElementById("malaLit").className = "block text-green-700 text-sm font-bold mb-2";
        } else {
            document.getElementById("malaLit").className = "block text-red-700 text-sm font-bold mb-2";
        }
        if(noweHaslo.match(/^(?=.*[A-Z]).{1,}$/)){
            document.getElementById("duzaLit").className = "block text-green-700 text-sm font-bold mb-2";
        } else {
            document.getElementById("duzaLit").className = "block text-red-700 text-sm font-bold mb-2";
        }
        if(noweHaslo.match(/^(?=.*\d).{1,}$/)){
            document.getElementById("cyfra").className = "block text-green-700 text-sm font-bold mb-2";
        } else {
            document.getElementById("cyfra").className = "block text-red-700 text-sm font-bold mb-2";
        }
    }

    return(
        <main className="grid place-items-center mt-20">
            <div className="w-full max-w-xs bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" name="form" id="form">
                <div className="mb-6 block text-gray-700 text-xl font-bold">
                    <h4>Zresetuj Hasło</h4>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Wpisz nowe hasło:
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="newpass" type="password" placeholder="Nowe hasło" onChange={sprawdzenieZasad}>

                    </input>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Ponownie wpisz nowe hasło:
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="newpass2" type="password" placeholder="Nowe hasło" onChange={sprawdzenieZasad}>

                    </input>
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
                    <button
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={noweHaslo}>
                        Zmień hasło
                    </button>
                </div>
            </div>
        </main>
    )
}
export default ResetPass;