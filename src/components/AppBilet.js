import $ from 'jquery';
import React, { Component } from 'react';
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from 'react-simple-captcha';
import {toast} from "react-toastify";


function setClock()
{
    let dt = new Date();
    let time = (dt.getHours() < 10 ? '0' : '') + dt.getHours() + ":" + (dt.getMinutes() < 10 ? '0' : '') + dt.getMinutes() + ":" + (dt.getSeconds() < 10 ? '0' : '') + dt.getSeconds() + "";

    $( '#Clock' ).html( time );
}
$( document ).ready( setClock );
setInterval( setClock, 1000 );

class AppBilet extends Component{

    componentDidMount () {
        loadCaptchaEnginge(6);
    };

    render() {
        function sprawdzBilet(e) {
            let user_captcha_value = document.getElementById('user_captcha_input').value;
            if (validateCaptcha(user_captcha_value)==true) {
                e.preventDefault();
                let numerBiletu = document.forms['form']['inputn'].value;
                document.getElementById("TicketInfo").innerHTML = "";
                if (numerBiletu.length != '10') {
                    document.getElementById("TicketInfo").innerHTML = "Numer karty musi posiadać 10 znaków!";
                    return false;
                }
                try {
                    let request = new XMLHttpRequest();
                    request.open('GET', 'https://mzkzg.org/api/checkCard/1.0.0/' + numerBiletu, false);
                    request.send(null);
                    const Data = JSON.parse(request.responseText);
                    var card_number = Data.resultData.data.data.karta.card_number;
                    var card_expire = Data.resultData.data.data.karta.card_expire;
                    var card_issuer = Data.resultData.data.data.karta.card_issuer;
                    var card_type = Data.resultData.data.data.karta.card_type;
                    document.getElementById("TicketInfo").innerHTML += "<table class='border-collapse border border-yellow-800 text-yellow-600 bg-black mt-2'><tr><td class='border border-yellow-600 w-2/5'>Numer karty: </td><td class='border border-yellow-600 w-3/5'>" + card_number + "</td></tr><tr><td class='border border-yellow-600'> Data wygaśnięcia karty: </td><td class='border border-yellow-600'>" + card_expire + "</td></tr><tr><td class='border border-yellow-600'>Wydawca karty: </td><td class='border border-yellow-600'>" + card_issuer + "</td></tr><tr><td class='border border-yellow-600'>Rodzaj karty: </td><td class='border border-yellow-600'>" + card_type + "</td></tr></table><hr>";
                    for (var i = 0; i < Data.resultData.data.data.bilety.length; i++) {
                        var ticket_type = Data.resultData.data.data.bilety[i].ticket_type;
                        var zone = Data.resultData.data.data.bilety[i].zone;
                        var valid_since = Data.resultData.data.data.bilety[i].valid_since;
                        var valid_for = Data.resultData.data.data.bilety[i].valid_for;
                        var price = Data.resultData.data.data.bilety[i].price;
                        var place = Data.resultData.data.data.bilety[i].place;
                        var issuer = Data.resultData.data.data.bilety[i].issuer;
                        if(place == null) place = "Brak informacji!";
                        if (ticket_type != '161') document.getElementById("TicketInfo").innerHTML += "<table class='border-collapse border border-yellow-800 text-yellow-600 bg-black mt-2'><tr><td class='border border-yellow-600 w-2/5'>Rodzaj biletu: </td><td class='border border-yellow-600 w-3/5'> " + ticket_type + "</td></tr><tr><td class='border border-yellow-600'>Strefa: </td><td class='border border-yellow-600'>" + zone + "</td></tr><tr><td class='border border-yellow-600'>Ważność: </td><td class='border border-yellow-600'>" + valid_since + " - " + valid_for + "</td></tr><tr><td class='border border-yellow-600'>Cena: </td><td class='border border-yellow-600'>" + price + " PLN</td></tr><tr><td class='border border-yellow-600'> Miejsce zakupu: </td><td class='border border-yellow-600'>" + place + "</td></tr><tr><td class='border border-yellow-600'> Emitent biletu: </td><td class='border border-yellow-600'>" + issuer + "</td></tr></table>";
                    }
                } catch (error) {
                    document.getElementById("TicketInfo").innerHTML = "Nie ma takiej karty w systemie!";
                }
            }
            else {
                toast.error("Zła captcha!", {
                    onClose: props => (sprawdzBilet)
                });
            }
        }

        return (
            <main className='grid place-items-center' >
                <div className="text-yellow-50 font-extrabold text-lg" id="Clock">
                    01:57
                </div>
                <div class="h-48 flex flex-wrap m-8 content-center py-8">
                    <form class="w-full max-w-sm space-y-4" name="form" id="form" >
                        <LoadCanvasTemplate/>
                        <input autocomplete="off"  type="text" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="user_captcha_input" placeholder="captcha"></input>
                        <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" id="inputn" placeholder="Podaj numer karty"></input>
                        <button class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4  rounded" type="button" onClick={sprawdzBilet}>Sprawdź!</button>
                    </form>
                    <a href="https://wniosek.mzkwejherowo.pl/isoke.html">
                        <button
                            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4  rounded">Kup bilet!
                        </button>
                    </a>
                </div>
                <div className="h-auto flex justify-center items-center mt-5">
                <div id="TicketInfo" />
                </div>
            </main>
        )
    }
}

export default AppBilet;
