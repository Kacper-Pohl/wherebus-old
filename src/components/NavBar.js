import { Fragment } from 'react'
import * as React from 'react';
import { Disclosure, Transition, Popover } from '@headlessui/react'
import { MenuIcon, XIcon } from '@heroicons/react/outline'
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useState } from 'react'
import Marquee from "react-fast-marquee";



let bilet = false;
let home = true;
let rozklad = false;
let wiadomosc;

var url = "https://ckan2.multimediagdansk.pl/displayMessages"
var ajax = new XMLHttpRequest();
ajax.open("GET", url, true);
ajax.send(null);
ajax.onreadystatechange = function () {
    if (ajax.readyState === 4 && (ajax.status === 200)) {
        const Data = JSON.parse(ajax.responseText);
        try {
            wiadomosc = Data["displaysMsg"][12]["messagePart1"] + Data["displaysMsg"][12]["messagePart2"];
        }catch {
            console.log("Cannot find display message for current stop");
            wiadomosc = "Nie ma obecnie żadnych komunikatów!";
        }
    }
}

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function NavBar (){

    const auth = getAuth();
    const logout = async () => {
        await signOut(auth);
    };
    let signedNB = [];
    let [user, setUser] = useState({});
    onAuthStateChanged(auth,(currentUser)=>{
        setUser(currentUser);
    })
    user = auth.currentUser;
    if (user === null) {
        signedNB = [
            { name: 'Sign In', href: '/signin', current: false},
            { name: 'Register', href: '/signup', current: false},
        ]
    }else{
        signedNB = [
            { name: 'Profile', href: '/profile', current: false},
            { name: 'Sign Out', onClick: {logout},  href: '/signout', current: false},
            { name: 'Zgłoś Propozycje', href: '/devproposal', current: false},
        ]
    }

    let navigation = [
        { name: 'Opóźnienia', href: '/', current: home },
        { name: 'Rozkład Jazdy', href: '/rozklad', current: rozklad },
        { name: 'Bilet', href: '/bilet', current: bilet },
    ]

    const location = window.location.pathname;
    switch(location.toString()){
        case '/bilet':
            bilet = true;
            home = false;
            rozklad = false;
            break;
        case '/rozklad':
            bilet = false;
            home = false;
            rozklad = true;
            break;
        case '/':
            bilet = false;
            home = true;
            rozklad = false;
            break;
        default:
            bilet = false;
            home = false;
            rozklad = false;
    }
    let avatar;
    if (user !== null) {
        avatar = user.photoURL;
        if(user.photoURL === null){
            avatar = "https://i.imgur.com/K9iRtZb.jpg";
        }
    }else{
        avatar = "https://i.imgur.com/K9iRtZb.jpg";
    }

    return (

        <Disclosure as="nav" className="bg-gradient-to-bl from-yellow-400 to-yellow-600">

            {({ open }) => (
                <>

                    <div className="static max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                        <div className="relative flex items-center justify-between h-16">
                            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                {/* Mobile menu button*/}
                                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            </div>
                            <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                                <div className="flex-shrink-0 flex items-center">
                                    <h1 className="text-4xl font-extrabold">WhereBus</h1>
                                </div>
                                <div className="hidden sm:block sm:ml-6">
                                    <div className="flex space-x-4">
                                        {navigation.map((item) => (
                                            <a
                                                key={item.name}
                                                href={item.href}
                                                className={classNames(
                                                    item.current ? 'bg-black text-white' : 'text-black hover:bg-gray-700 hover:text-white',
                                                    'px-3 py-2 rounded-md text-sm font-medium'
                                                )}
                                                aria-current={item.current ? 'page' : undefined}
                                            >
                                                {item.name}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                                {/* Narazie wyłączone bo i tak nie korzystamy, a testuje
                               <button
                                    type="button"
                                    className="bg-black p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                                >
                                    <span className="sr-only">View notifications</span>
                                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                                </button>
                                */}

                                {/* Profile dropdown */}
                                <Popover>
                                    <Popover.Button>
                                        <img
                                            className="static mt-1 h-10 w-10 rounded-full bg-gray-500"
                                            src={avatar}
                                            alt=""
                                        />
                                    </Popover.Button>
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-200"
                                        enterFrom="opacity-0 translate-y-1"
                                        enterTo="opacity-100 translate-y-0"
                                        leave="transition ease-in duration-150"
                                        leaveFrom="opacity-100 translate-y-0"
                                        leaveTo="opacity-0 translate-y-1"
                                    >
                                    <Popover.Panel className="absolute z-10 w-auto">
                                        <div className="relative grid gap-1 bg-white  w-20 rounded-md">
                                            {signedNB.map((item) => (
                                                <a
                                                    key={item.name}
                                                    onClick={item.onClick}
                                                    href={item.href}
                                                    className={classNames(
                                                        item.current ? 'bg-black text-white' : 'text-black hover:bg-gray-700 hover:text-white',
                                                        'px-2 py-1 rounded text-sm font-medium'
                                                    )}
                                                    aria-current={item.current ? 'page' : undefined}
                                                >
                                                    {item.name}<br/>
                                                </a>
                                            ))}
                                        </div>
                                    </Popover.Panel>
                                    </Transition>
                                </Popover>
                                <a id="email" className="ml-12 fixed text-black">
                                    {user?.email}
                                </a>
                            </div>
                        </div>


                    </div>
                    <Marquee pauseOnHover={true} speed={80} gradient={false} className="sticky">
                        <div>
                            {wiadomosc}
                        </div>
                    </Marquee>
                    <Disclosure.Panel className="sm:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navigation.map((item) => (
                                <Disclosure.Button
                                    key={item.name}
                                    as="a"
                                    href={item.href}
                                    className={classNames(
                                        item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                        'block px-3 py-2 rounded-md text-base font-medium'
                                    )}
                                    aria-current={item.current ? 'page' : undefined}
                                >
                                    {item.name}
                                </Disclosure.Button>
                            ))}
                        </div>
                    </Disclosure.Panel>

                </>
            )}

        </Disclosure>

    )
}

export default NavBar;
