import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from "react";
import {toast} from "react-toastify";

const firebaseConfig = {
    apiKey: "AIzaSyDo8C_9oRvSdkcz_QtZxC4LXfavCzLQmCM",
    authDomain: "wherebus-og.firebaseapp.com",
    projectId: "wherebus-og",
    storageBucket: "wherebus-og.appspot.com",
    messagingSenderId: "441562088294",
    appId: "1:441562088294:web:dc63a3052772b162d97ea7",
    measurementId: "G-G8P5SSMW16"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const storage = getStorage();

export function useAuth(){
    const[currentUser, setCurrentUser] = useState();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, user => setCurrentUser(user));
        return unsub;
    }, [])
    return currentUser;
}

//Storage
export async function upload(file, currentUser, setLoading){
    const fileRef = ref(storage, currentUser.uid + '.png');

    setLoading(true);

    const snapshot = await uploadBytes(fileRef, file);
    const photoURL = await getDownloadURL(fileRef);

    updateProfile(currentUser, {photoURL});

    setLoading(false);
    toast.success("Wczytano zdjęcie!", {
        onClose: props => window.location.pathname = "/profile",
    });

}

export const authentication = getAuth(app);