import React, {useState} from 'react';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {KeyIcon, PencilIcon} from "@heroicons/react/solid";
import Tooltip from '@mui/material/Tooltip';


function Profile(){
    let avatar;
    const auth = getAuth();
    let [user, setUser] = useState({});
    onAuthStateChanged(auth,(currentUser)=>{
        setUser(currentUser);
    })
    user = auth.currentUser;
    if (user !== null) {
        avatar = user.photoURL;
        if(user.photoURL === null){
            avatar = "https://i.imgur.com/K9iRtZb.jpg";
        }
    }else{
        avatar = "https://i.imgur.com/K9iRtZb.jpg";
    }

    return(
        <main className="grid place-items-center mt-20">
            <div id="whoobe-swr0n"
                 className="pt-4 bg-white w-full md:w-60 justify-center items-center shadow px-6 py-4 flex flex-col">
                <img
                    src={avatar}
                    alt="img" title="img" className="rounded-full h-40 w-40 object-cover" id="whoobe-7jr8o"/>
                <div className=" mt-8 border-b-2 w-auto">
                    <h4 className="static" id="whoobe-5f06f">{user?.displayName}
                        <a className="absolute" href="/changename">
                            <Tooltip title="Zmiana nazwy">
                            <PencilIcon className="block h-4 w-4 mt-1 ml-0.5" aria-hidden="true"/>
                            </Tooltip>
                        </a>
                    </h4>
                </div>

                <div className="mb-3 text-center" id="whoobe-m2doo">{user?.email}</div>
                <a className="text-xs static text-black hover:text-blue-500 " href="/changeimage">
                    <button>Zmień zdjęcie</button>
                    <a className="absolute">

                    </a>

                </a>
                <div className="">
                <a className="text-xs static text-black hover:text-blue-500 " href="/changepass">
                    <button>Zmień hasło</button>
                    <a className="absolute">
                        <KeyIcon className="block h-2 w-2 mt-2"/>
                    </a>

                </a>
                </div>
            </div>
        </main>
    )
}
export default Profile;