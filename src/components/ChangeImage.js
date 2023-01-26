import React, {useEffect, useState} from 'react';
import { getAuth, updateProfile } from "firebase/auth";
import { useAuth, upload } from "../base";
import {toast} from "react-toastify";



function ChangeImage(){

    const currentUser = useAuth();
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [photoURL, setPhotoURL] = useState("https://i.imgur.com/K9iRtZb.jpg");
    const [isDisabled, setDisabled] = useState(true);

    useEffect(() => {
        if(currentUser?.photoURL) {
            setPhotoURL(currentUser.photoURL);
        }
    }, [currentUser])

    function zmianaZdj(){
        const auth = getAuth();
        let adresURL = document.getElementById("imageURL").value;
        if (auth.currentUser !== null) {
            if(adresURL.match(/^http[^\?]/g)) { //Sprawdzanie http
                if(adresURL.match(/(http(s):\/\/)+([a-zA-Z0-9-_.]{2,256})+[\/]+[a-zA-Z0-9]{2,256}/g)) { //Sprawdzanie nazwa domeny+ .com itp..
                    if (adresURL.match(/^http[^\?]*.(jpg|jpeg|png)(\?(.*))?$/gmi)) { //Sprawdzanie końcówki
                        updateProfile(auth.currentUser, {
                            photoURL: adresURL
                        }).then(() => {
                            window.location.pathname = "/profile";
                            toast.success("Udało się zmienić zdjęcie!");
                        }).catch((error) => {
                            toast.error("Coś poszło nie tak!");
                            console.log(error);
                        });
                    } else {
                        toast.error("Podany link nie kończy się obsługującym typem plików!")
                    }
                } else {
                    toast.error("Nieprawidłowy link!");
                }
            } else{
                toast.error("Brak http(s)!");
            }
        } else {
            toast.error("Nie wykryto zalogowanego użytkownika!");
        }
    }

    function handleChange(e){  //Zmiana budowy, żeby odpowiednio wyłapywało kiedy co i jak jest pięć
        if(loading || !photo){
            document.getElementById("wczytZdj").className = "py-2 px-4 bg-yellow-500 hover:bg-yellow-700 mt-8 text-white font-semibold rounded-lg shadow-md";
            setDisabled(false);
        } else {
            document.getElementById("wczytZdj").className = "bg-yellow-500 text-white font-bold py-2 px-4 mt-8 rounded opacity-50 cursor-not-allowed";
            setDisabled(true);
        }
        if(e.target.files[0]){
            setPhoto(e.target.files[0])
            document.getElementById("wczytZdj").className = "py-2 px-4 bg-yellow-500 hover:bg-yellow-700 mt-8 text-white font-semibold rounded-lg shadow-md";
            setDisabled(false);
        } else {
            setPhoto(null);
        }
    }

    function handleClick(){
        if(photo.size < 500000) { //Jak rozmiar poniżej 500KB to lecy dalej
            upload(photo, currentUser, setLoading);
        } else {
            toast.error("Zbyt duży rozmiar pliku! Przyjmowane do 500KB");
        }
    }

    function handleDrop(e){
        const allowedTypes = new Set([e.target.accept]);
        if (!allowedTypes.has(e.dataTransfer.files[0].type)) {
            // stop event prepagation
            e.preventDefault();
        }
    }

    return(
        <main className="grid place-items-center mt-20">
            <div className="w-full max-w-xs bg-white shadow-md rounded px-8 pt-8 pb-8 mb-20" id="form">
                <div className="mb-6 block text-gray-700 text-xl font-bold">
                    <h4>Zmień zdjęcie profilu</h4>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Podaj adres URL zdjęcia:
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="imageURL" type="text" placeholder="Adres URL...">

                    </input>
                </div>
                <div className="flex items-center justify-between">
                    <button
                        className="py-2 px-4 bg-yellow-500 hover:bg-yellow-700 mb-8 text-white font-semibold rounded-lg shadow-md"
                        onClick={zmianaZdj}>
                        Zmień zdjęcie
                    </button>
                </div>
                <div>
                    <input input class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" aria-describedby="file_input_help" id="file_input" type="file" accept=".png, .jpg" onChange={handleChange} onDrop={handleDrop} />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">PNG or JPG (MAX. 500KB).</p>
                    <button id="wczytZdj" disabled={isDisabled} onClick={handleClick} className="bg-yellow-500 text-white font-bold py-2 px-4 mt-8 rounded opacity-50 cursor-not-allowed">Wczytaj zdjęcie</button>
                </div>
            </div>
        </main>
    )
}
export default ChangeImage;