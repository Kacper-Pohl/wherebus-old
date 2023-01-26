import $ from 'jquery';
import 'select2';
import React, { Component } from "react";
import fetch from 'cross-fetch';

function setClock()
{
    var dt = new Date();
    var time = (dt.getHours() < 10 ? '0' : '') + dt.getHours() + ":" + (dt.getMinutes() < 10 ? '0' : '') + dt.getMinutes() + ":" + (dt.getSeconds() < 10 ? '0' : '') + dt.getSeconds() + "";

    $( '#Clock' ).html( time );
}
$( document ).ready( setClock);
setInterval( setClock, 1000 );

function getNearestDate(array) {
    return array.sort((a, b) => new Date(a) - new Date(b));
}

function getTripId(id_busa) {
    return (id_busa.substr(id_busa.indexOf('R'), id_busa.length) + id_busa.substr(0, id_busa.indexOf('R')));
}

function getSeparatChar(text) {
    if (text.includes('>')) {
        return '>';
    }
    else if (text.includes('-')) {
        return '-';
    }
}

function getRidOfBrackets(text) {
    if (text.includes('(')) {
        return text.indexOf('(') - 1;
    }
    else {
        return text.length;
    }
}

function getClearDestination(destination) {
    destination = destination.substr(destination.indexOf(getSeparatChar(destination))+2, destination.length);
    return destination.substr(0, getRidOfBrackets(destination)+1);
}

export class StopsService {
    stops = {};
    stopsWithIds = {};
    facilities = {};
    constructor() {}
    getStops() {
        fetch(
            "https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/4c4025f0-01bf-41f7-a39f-d156d201b82b/download/stops.json"
        )
            .then((res) => res.json())
            .then((body) => {
                this.setStops(body);
                this.getFacility();
            }).catch(err=>{
            console.log(err)
        });
    }
    setStops(stops) {
        let dates = getNearestDate(Object.keys(stops));
        if (dates.length > 0) {
            this.stops = stops[dates[0]]?.stops.filter(stop=>stop.stopDesc.indexOf("(techniczny)")===-1)
            this.setStopsWithId();
        } else console.log("Cannot find any stop information");
    }
    setStopsWithId() {
        this.stops.forEach((x) => {
            let stopName = x.stopDesc.replace(" (N/Ż)", "").trimEnd();
            this.stopsWithIds[stopName]
                ? this.stopsWithIds[stopName].push(x.stopId)
                : (this.stopsWithIds[stopName] = [x.stopId]);
        });
    }
    getFacility() {
        fetch(
            "https://api.allorigins.win/raw?url=https://files.cloudgdansk.pl/d/otwarte-dane/ztm/baza-pojazdow.json", {}
        )
            .then((res) => res.json())
            .then((body) => {
                this.setFacility(body);
            })
            .catch(err=>{
                console.log(err)
            })
    }
    setFacility(facilities) {
        this.facilities["results"] = facilities.results;
    }
}

export class RoutesService {
    routes = {};
    getRoutes() {
        return fetch(
            "https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/22313c56-5acf-41c7-a5fd-dc5dc72b3851/download/routes.json"
        )
            .then((res) => res.json())
            .then((body) => {
                this.setRoutes(body);
                this.showRoutes();
            })
            .catch(err=>{
                console.log(err)
            })
    }
    setRoutes(routes) {
        let dates = getNearestDate(Object.keys(routes));
        if (dates.length > 0) {
            let routesArray = routes[dates[0]]?.routes;
            routesArray.forEach((route) => {
                this.routes[route.routeId] = route.routeShortName;
            });
        } else console.log("Cannot find any routes information");
    }
    showRoutes() {
    }
}

export class TripsService {
    trips = {};
    getTrips() {
        return fetch(
            "https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/b15bb11c-7e06-4685-964e-3db7775f912f/download/trips.json"
        )
            .then((res) => res.json())
            .then((body) => {
                this.setTrips(body);
            })
            .catch(err=>{
                console.log(err)
            })
    }
    setTrips(trips) {
        let dates = getNearestDate(Object.keys(trips));
        if (dates.length > 0) {
            let tripsArray = trips[dates[0]]?.trips;
            tripsArray.forEach((trip) => {
                this.trips[trip.id] = trip.tripHeadsign;
            });
        } else console.log("Cannot find any routes information");
    }
}

function getDogodnienia(mydata, numer_busa, kierunek, linia, czas_theo, czas_est) {
    for(var i = 0; i < mydata["results"].length; i++){
        if(numer_busa == mydata["results"][i].nr_inwentarzowy){
            var czy_usb = mydata["results"][i].USB;
            var czy_klima = mydata["results"][i].klimatyzacja;
            var czy_aed = mydata["results"][i].AED;
            var rok_produkcji = mydata["results"][i].rok_produkcji;
            document.getElementById("DeparturesContainer1").innerHTML += "<table class='border-collapse border border-gray-900 text-yellow-500 font-bold text-lg'><tr '><td class='w-9/12'>Numer linii: </td><td class='w-3/12'>" + linia + "</td></tr><tr><td>Numer pojazdu: </td><td>" + numer_busa + "</td></tr><tr><td>Do: </td><td>" + kierunek + "</td></tr><tr><td>Czas rozkładowy: </td><td>" + czas_theo + "</td></tr><tr><td>Czas przewidywany: </td><td>" + czas_est + "</td></tr><tr><td>Rok produkcji: </td><td>" + rok_produkcji + "</td></tr><tr><td>USB: </td><td>" + czy_usb + "</td></tr><tr><td>Klimatyzacja: </td><td>" + czy_klima + "</td></tr><tr><td>AED: </td><td>" + czy_aed + "</td></tr></table><br>";
            return true;
        }
        else if(i == mydata["results"].length-1){
            document.getElementById("DeparturesContainer1").innerHTML += "<table class='border-collapse border border-gray-900 text-yellow-500 font-bold text-lg'><tr><td class='w-9/12'>Numer linii: </td><td class='w-3/12'>" + linia + "</td></tr><tr><td>Numer pojazdu: </td><td>" + numer_busa + "</td></tr><tr><td>Do: </td><td>" + kierunek + "</td></tr><tr><td>Czas rozkładowy: </td><td>" + czas_theo + "</td></tr><tr><td>Czas przewidywany: </td><td>" + czas_est + "</td></tr><tr><td>Brak dodatkowych informacji o pojeździe </td></tr></table><br>";
        }
    }
}

export const routesService = new RoutesService();
routesService.getRoutes();
export const stopsService = new StopsService();
stopsService.getStops();
export const tripsService = new TripsService();
tripsService.getTrips();
const routes_data = routesService.routes;
const trips_data = tripsService.trips;
const Data3 = stopsService.stopsWithIds;
const mydata = stopsService.facilities;

class Opoznienia extends Component{
    render(){
        function getRoute(e){
            e.preventDefault();
            var czy_weszlo = 0;
            document.getElementById("DeparturesContainer1").innerHTML = "";
            var url = "https://ckan2.multimediagdansk.pl/delays"
            var ajax = new XMLHttpRequest();
            ajax.open("GET", url, true);
            ajax.send(null);
            var stopName = document.getElementById("cokolwiek").value;
            ajax.onreadystatechange = function () {
                if (ajax.readyState === 4 && (ajax.status === 200)) {
                    const Data = JSON.parse(ajax.responseText);
                    try {
                        for (var j = 0; j < Data3[stopName].length; j++) {
                            console.log(Data[Data3[stopName][j]].delay.length);
                            for (var i = 0; i < Data[Data3[stopName][j]].delay.length; i++) {
                                czy_weszlo++;
                                try {
                                    var id_busa = Data[Data3[stopName][j]].delay[i].id;
                                    var numer_busa = Data[Data3[stopName][j]].delay[i].vehicleCode;
                                    var kierunek = getClearDestination(trips_data[getTripId(id_busa)]);
                                    var id_trasy = Data[Data3[stopName][j]].delay[i].routeId;
                                    var linia = routes_data[id_trasy];
                                    var czas_theo = Data[Data3[stopName][j]].delay[i].theoreticalTime;
                                    var czas_est = Data[Data3[stopName][j]].delay[i].estimatedTime;
                                    getDogodnienia(mydata, numer_busa, kierunek, linia, czas_theo, czas_est);
                                    //document.getElementById("DeparturesContainer1").innerHTML += "<table class='border-separate border border-gray-900 bg-black text-yellow-500 font-bold text-lg'><tr><td>Id busa: </td><td> " + id_busa + "</td></tr><tr><td>Trasa: </td><td>" + id_trasy + "</td></tr><tr><td>Do: </td><td>" + kierunek + "</td></tr><tr><td>Czas rozkładowy: </td><td>" + czas_theo + "</td></tr><tr><td>Czas przewidywany: </td><td>" + czas_est + "</td></tr></table><br>";
                                } catch {
                                    console.log('zle');
                                }
                            }
                            if(Data[Data3[stopName][j]].delay.length == 0 && j == Data3[stopName].length-1 && document.getElementById("DeparturesContainer1").innerHTML == "" && czy_weszlo == 0){
                                document.getElementById("DeparturesContainer1").innerHTML += "<div class='text-yellow-50 font-extrabold text-lg'><a>Z wybranego przystanku nie ma obecnie żadnych odjazdów!</a></div>";
                            }
                        }
                    } catch {
                        document.getElementById("DeparturesContainer1").innerHTML += "<div class='text-yellow-50 font-extrabold text-lg'><a>Z wybranego przystanku nie ma obecnie żadnych odjazdów!</a></div>";
                    }
                }
                else {
                    console.log("not ready yet")
                }
            }
        }

        return (
            <main className="grid place-items-center w-auto">
                <div className="text-yellow-50 font-extrabold text-lg" id="Clock">
                    01:57
                </div>
                <form id="StopSelectionForm" onSubmit={getRoute}>
                    <select name="StopName" id="cokolwiek"
                            className="js-example-basic-single h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline"
                            onChange="this.form.submit()">
                        <option value="Makro">"Makro"</option>
                        <option value="1 Maja">1 Maja [PG]</option>
                        <option value="10 Lutego - Skwer Kościuszki">10 Lutego - Skwer Kościuszki</option>
                        <option value="23 Marca">23 Marca</option>
                        <option value="25-lecia Solidarności">25-lecia Solidarności</option>
                        <option value="3 Maja - Hala">3 Maja - Hala</option>
                        <option value="3 Maja">3 Maja [GDY]</option>
                        <option value="3 Maja ">3 Maja [SOP]</option>
                        <option value="49 Baza Lotnicza">49 Baza Lotnicza</option>
                        <option value="Abrahama">Abrahama</option>
                        <option value="Aeroklub Gdański">Aeroklub Gdański</option>
                        <option value="Agrarna">Agrarna</option>
                        <option value="Akademia Marynarki Wojennej" selected="selected">Akademia Marynarki Wojennej
                        </option>
                        <option value="Akademia Muzyczna">Akademia Muzyczna</option>
                        <option value="Aksamitna">Aksamitna</option>
                        <option value="Alzacka">Alzacka</option>
                        <option value="AmberExpo">AmberExpo</option>
                        <option value="Amona">Amona</option>
                        <option value="Andruszkiewicza">Andruszkiewicza</option>
                        <option value="Anyżowa">Anyżowa</option>
                        <option value="Archikatedra Oliwska">Archikatedra Oliwska</option>
                        <option value="Architektów">Architektów</option>
                        <option value="Arciszewskich">Arciszewskich</option>
                        <option value="Armii Krajowej">Armii Krajowej</option>
                        <option value="Astronautów">Astronautów</option>
                        <option value="Azaliowa">Azaliowa</option>
                        <option value="Babie Doły">Babie Doły</option>
                        <option value="Bajana">Bajana</option>
                        <option value="Bajki">Bajki</option>
                        <option value="Banino Szkoła">Banino Szkoła</option>
                        <option value="Barniewicka">Barniewicka</option>
                        <option value="Bartnicza">Bartnicza</option>
                        <option value="Batalionów Chłopskich">Batalionów Chłopskich</option>
                        <option value="Batorego - Szkoła">Batorego - Szkoła</option>
                        <option value="Baza Hallera">Baza Hallera</option>
                        <option value="Baza Manipulacyjna">Baza Manipulacyjna</option>
                        <option value="Baza na Pogórzu Dolnym">Baza na Pogórzu Dolnym</option>
                        <option value="Baśniowa">Baśniowa</option>
                        <option value="Bażyńskiego [GDA]">Bażyńskiego [GDA]</option>
                        <option value="Bażyńskiego [GDY]">Bażyńskiego [GDY]</option>
                        <option value="Belgradzka">Belgradzka</option>
                        <option value="Bema">Bema</option>
                        <option value="Beniowskiego">Beniowskiego</option>
                        <option value="Beniowskiego - Akademiki">Beniowskiego - Akademiki</option>
                        <option value="Benisławskiego">Benisławskiego</option>
                        <option value="Benzynowa">Benzynowa</option>
                        <option value="Bernadowska">Bernadowska</option>
                        <option value="Biała">Biała</option>
                        <option value="Białowieska">Białowieska</option>
                        <option value="Biały Dwór">Biały Dwór</option>
                        <option value="Biblioteka Główna UG">Biblioteka Główna UG</option>
                        <option value="Bieszczadzka">Bieszczadzka</option>
                        <option value="Bitwy pod Płowcami">Bitwy pod Płowcami</option>
                        <option value="Biwakowa">Biwakowa</option>
                        <option value="Bluszczowa">Bluszczowa</option>
                        <option value="Bobrowa">Bobrowa</option>
                        <option value="Bogatka I">Bogatka I</option>
                        <option value="Bogatka II">Bogatka II</option>
                        <option value="Bogatka III">Bogatka III</option>
                        <option value="Boguckiego">Boguckiego</option>
                        <option value="Bohaterów Monte Cassino [PG]">Bohaterów Monte Cassino [PG]</option>
                        <option value="Bohaterów Monte Cassino [SOP]">Bohaterów Monte Cassino [SOP]</option>
                        <option value="Bojano">Bojano</option>
                        <option value="Bojano - Kościół">Bojano - Kościół</option>
                        <option value="Bojano - Milenium">Bojano - Milenium</option>
                        <option value="Bojano - Rolnicza">Bojano - Rolnicza</option>
                        <option value="Bora-Komorowskiego">Bora-Komorowskiego</option>
                        <option value="Borowiecka">Borowiecka</option>
                        <option value="Borska">Borska</option>
                        <option value="Bosmańska - Nasypowa">Bosmańska - Nasypowa</option>
                        <option value="Bosmańska - Zielona">Bosmańska - Zielona</option>
                        <option value="Botaniczna">Botaniczna</option>
                        <option value="Bpa Okoniewskiego">Bpa Okoniewskiego</option>
                        <option value="Brama Nizinna">Brama Nizinna</option>
                        <option value="Brama Oliwska">Brama Oliwska</option>
                        <option value="Brama Oruńska">Brama Oruńska</option>
                        <option value="Brama Wyżynna">Brama Wyżynna</option>
                        <option value="Brama Żuławska">Brama Żuławska</option>
                        <option value="Bratki">Bratki</option>
                        <option value="Brodnicka">Brodnicka</option>
                        <option value="Brodwino">Brodwino</option>
                        <option value="Brodwino - Szkoła">Brodwino - Szkoła</option>
                        <option value="Bryla">Bryla</option>
                        <option value="Brzechwy">Brzechwy</option>
                        <option value="Brzegowa">Brzegowa</option>
                        <option value="Brzeźno">Brzeźno</option>
                        <option value="Brętowo PKM">Brętowo PKM</option>
                        <option value="Budapesztańska">Budapesztańska</option>
                        <option value="Budzysza">Budzysza</option>
                        <option value="Bulwar Nadmorski">Bulwar Nadmorski</option>
                        <option value="Bursztynowa">Bursztynowa</option>
                        <option value="Bysewo">Bysewo</option>
                        <option value="Bławatna">Bławatna</option>
                        <option value="Błonia">Błonia</option>
                        <option value="CH Port Rumia - Grunwaldzka">CH "Port Rumia" - Grunwaldzka</option>
                        <option value="CH Port Rumia - Kosynierów">CH "Port Rumia" - Kosynierów</option>
                        <option value="Cebertowicza">Cebertowicza</option>
                        <option value="Cechowa">Cechowa</option>
                        <option value="Cedrowa">Cedrowa</option>
                        <option value="Celna">Celna</option>
                        <option value="Centrostal">Centrostal</option>
                        <option value="Centrum Handlowe Port Rumia">Centrum Handlowe "Port Rumia"</option>
                        <option value="Centrum Handlowe Riviera">Centrum Handlowe "Riviera"</option>
                        <option value="Centrum Handlowe Batory">Centrum Handlowe Batory</option>
                        <option value="Centrum Medycyny Inwazyjnej">Centrum Medycyny Inwazyjnej</option>
                        <option value="Centrum Nadawcze RTV">Centrum Nadawcze RTV</option>
                        <option value="Centrum Nauki Experyment">Centrum Nauki Experyment</option>
                        <option value="Centrum Onkologii">Centrum Onkologii</option>
                        <option value="Ceynowy">Ceynowy</option>
                        <option value="Chabrowa">Chabrowa</option>
                        <option value="Chałubińskiego">Chałubińskiego</option>
                        <option value="Chełm - Więckowskiego">Chełm - Więckowskiego</option>
                        <option value="Chełm Cienista">Chełm Cienista</option>
                        <option value="Chełm Witosa">Chełm Witosa</option>
                        <option value="Chełmońskiego">Chełmońskiego</option>
                        <option value="Chmielna">Chmielna</option>
                        <option value="Chodowieckiego">Chodowieckiego</option>
                        <option value="Chopina [PG]">Chopina [PG]</option>
                        <option value="Chopina [SOP]">Chopina [SOP]</option>
                        <option value="Chrobrego">Chrobrego</option>
                        <option value="Chrzanowskiego - Przychodnia">Chrzanowskiego - Przychodnia</option>
                        <option value="Chrzanowskiego [GDA]">Chrzanowskiego [GDA]</option>
                        <option value="Chrzanowskiego [GDY]">Chrzanowskiego [GDY]</option>
                        <option value="Chwarzno Apollina">Chwarzno Apollina</option>
                        <option value="Chwarzno Polanki">Chwarzno Polanki</option>
                        <option value="Chwarzno Sokółka">Chwarzno Sokółka</option>
                        <option value="Chwaszczyno">Chwaszczyno</option>
                        <option value="Chwaszczyno - Boczna">Chwaszczyno - Boczna</option>
                        <option value="Chwaszczyno - Gdyńska">Chwaszczyno - Gdyńska</option>
                        <option value="Chwaszczyno - Lisia">Chwaszczyno - Lisia</option>
                        <option value="Chwaszczyno - Oliwska">Chwaszczyno - Oliwska</option>
                        <option value="Chwaszczyno - Poczta">Chwaszczyno - Poczta</option>
                        <option value="Chwaszczyno - Szmaragdowa">Chwaszczyno - Szmaragdowa</option>
                        <option value="Chwaszczyno - Wiejska">Chwaszczyno - Wiejska</option>
                        <option value="Chylonia Centrum">Chylonia Centrum</option>
                        <option value="Chylonia Dworzec PKP">Chylonia Dworzec PKP</option>
                        <option value="Chylonia Krzywoustego">Chylonia Krzywoustego</option>
                        <option value="Chylonia Dworzec PKP">Chylońska - Kcyńska</option>
                        <option value="Chłodna">Chłodna</option>
                        <option value="Chłopska">Chłopska</option>
                        <option value="Ciasna">Ciasna</option>
                        <option value="Cicha (Cmentarz)">Cicha (Cmentarz)</option>
                        <option value="Cieszyńskiego">Cieszyńskiego</option>
                        <option value="Ciołkowskiego">Ciołkowskiego</option>
                        <option value="Cisowa Granica Miasta">Cisowa Granica Miasta</option>
                        <option value="Cisowa SKM">Cisowa SKM</option>
                        <option value="Cisowa Sibeliusa">Cisowa Sibeliusa</option>
                        <option value="Cmentarna">Cmentarna</option>
                        <option value="Cmentarz">Cmentarz</option>
                        <option value="Cmentarz Komunalny">Cmentarz Komunalny</option>
                        <option value="Cmentarz Oliwski">Cmentarz Oliwski</option>
                        <option value="Cmentarz Srebrzysko">Cmentarz Srebrzysko</option>
                        <option value="Cmentarz Witomiński">Cmentarz Witomiński</option>
                        <option value="Cmentarz Łostowicki">Cmentarz Łostowicki</option>
                        <option value="Cygańska Góra">Cygańska Góra</option>
                        <option value="Cylkowskiego">Cylkowskiego</option>
                        <option value="Cyprysowa">Cyprysowa</option>
                        <option value="Cystersów">Cystersów</option>
                        <option value="Czarny Dwór">Czarny Dwór</option>
                        <option value="Czermińskiego">Czermińskiego</option>
                        <option value="Czernickiego I">Czernickiego I</option>
                        <option value="Czernickiego II">Czernickiego II</option>
                        <option value="Czerwony Dwór">Czerwony Dwór</option>
                        <option value="Czwartaków">Czwartaków</option>
                        <option value="Czwartaków">Czyżewskiego</option>
                        <option value="Damroki">Damroki</option>
                        <option value="Dembińskiego">Dembińskiego</option>
                        <option value="Demptowo">Demptowo</option>
                        <option value="Demptowo - Jednostka Wojskowa">Demptowo - Jednostka Wojskowa</option>
                        <option value="Demptowska">Demptowska</option>
                        <option value="Derdowskiego">Derdowskiego</option>
                        <option value="Derdowskiego - Dębogórska">Derdowskiego - Dębogórska</option>
                        <option value="Derdowskiego - Przychodnia">Derdowskiego - Przychodnia</option>
                        <option value="Dickensa">Dickensa</option>
                        <option value="Do Zdroju">Do Zdroju</option>
                        <option value="Dobra">Dobra</option>
                        <option value="Dobrowo">Dobrowo</option>
                        <option value="Dobrowolskiego">Dobrowolskiego</option>
                        <option value="Dobrzewino - Bojańska">Dobrzewino - Bojańska</option>
                        <option value="Dobrzewino - Dworska">Dobrzewino - Dworska</option>
                        <option value="Dobrzewino - Grabowa">Dobrzewino - Grabowa</option>
                        <option value="Dobrzewino - Kasztelańska">Dobrzewino - Kasztelańska</option>
                        <option value="Dobrzewino - Owsiana">Dobrzewino - Owsiana</option>
                        <option value="Dokerów">Dokerów</option>
                        <option value="Dolna">Dolna</option>
                        <option value="Dolne Młyny">Dolne Młyny</option>
                        <option value="Dolny Sopot - Haffnera">Dolny Sopot - Haffnera</option>
                        <option value="Dom Marynarza">Dom Marynarza</option>
                        <option value="Dom Pomocy Społecznej">Dom Pomocy Społecznej</option>
                        <option value="Domeyki">Domeyki</option>
                        <option value="Dragana - Kładka">Dragana - Kładka</option>
                        <option value="Dragana - Szkoła">Dragana - Szkoła</option>
                        <option value="Drwęcka (n/ż)">Drwęcka (n/ż)</option>
                        <option value="Drzewieckiego">Drzewieckiego</option>
                        <option value="Drzymały">Drzymały</option>
                        <option value="Dulkowa">Dulkowa</option>
                        <option value="Dworkowa">Dworkowa</option>
                        <option value="Dworska">Dworska</option>
                        <option value="Dworzec Główny">Dworzec Główny</option>
                        <option value="Dworzec Morski - Muzeum Emigracji">Dworzec Morski - Muzeum Emigracji</option>
                        <option value="Dworzec PKS">Dworzec PKS</option>
                        <option value="Dwór Ferberów">Dwór Ferberów</option>
                        <option value="Dywizjonu 303">Dywizjonu 303</option>
                        <option value="Działki Leśne - Sztumska">Działki Leśne - Sztumska</option>
                        <option value="Dziewicza">Dziewicza</option>
                        <option value="Dąbka - Zespół Szkół">Dąbka - Zespół Szkół</option>
                        <option value="Dąbka - Zielona">Dąbka - Zielona</option>
                        <option value="Dąbrowa Centrum">Dąbrowa Centrum</option>
                        <option value="Dąbrowa Miętowa">Dąbrowa Miętowa</option>
                        <option value="Dąbrowskiego">Dąbrowskiego</option>
                        <option value="Dąbrowskiego - Kościół">Dąbrowskiego - Kościół</option>
                        <option value="Dąbrowskiego - Most">Dąbrowskiego - Most</option>
                        <option value="Dębinki">Dębinki</option>
                        <option value="Dębogórze - Jednostka Wojskowa">Dębogórze - Jednostka Wojskowa</option>
                        <option value="Dębogórze - Naftobazy">Dębogórze - Naftobazy</option>
                        <option value="Dębogórze - Okopowa">Dębogórze - Okopowa</option>
                        <option value="Dębogórze - Owocowa">Dębogórze - Owocowa</option>
                        <option value="Dębogórze - Partyzantów">Dębogórze - Partyzantów</option>
                        <option value="Dębogórze - Szkoła">Dębogórze - Szkoła</option>
                        <option value="Dębogórze - Słonecznikowa">Dębogórze - Słonecznikowa</option>
                        <option value="Dębogórze-Wybudowanie - Boisko">Dębogórze-Wybudowanie - Boisko</option>
                        <option value="Dębogórze-Wybudowanie - Długa">Dębogórze-Wybudowanie - Długa
                        </option>
                        <option value="Dębogórze-Wybudowanie - Leśna">Dębogórze-Wybudowanie - Leśna
                        </option>
                        <option value="Dębogórze-Wybudowanie - Mostowa">Dębogórze-Wybudowanie - Mostowa
                        </option>
                        <option value="Długa">Długa</option>
                        <option value="Długie Ogrody">Długie Ogrody</option>
                        <option value="Ejsmonda">Ejsmonda</option>
                        <option value="Elbląska">Elbląska</option>
                        <option value="Elektrociepłownia - Kontenerowa">Elektrociepłownia - Kontenerowa</option>
                        <option value="Elektrociepłownia - Pucka">Elektrociepłownia - Pucka</option>
                        <option value="Elektrowozownia SKM">Elektrowozownia SKM</option>
                        <option value="Elfów">Elfów</option>
                        <option value="Emaus">Emaus</option>
                        <option value="Emilii Plater">Emilii Plater</option>
                        <option value="Energetyków">Energetyków</option>
                        <option value="Ergo Arena">Ergo Arena</option>
                        <option value="Europejskie Centrum Solidarności">Europejskie Centrum Solidarności</option>
                        <option value="Fabryczna">Fabryczna</option>
                        <option value="Fabryczny">Fabryczny</option>
                        <option value="Faktoria">Faktoria</option>
                        <option value="Falista">Falista</option>
                        <option value="Falowa">Falowa</option>
                        <option value="Fenikowskiego">Fenikowskiego</option>
                        <option value="Filipkowskiego">Filipkowskiego</option>
                        <option value="Firoga">Firoga</option>
                        <option value="Focha">Focha</option>
                        <option value="Forsycji">Forsycji</option>
                        <option value="Fredry">Fredry</option>
                        <option value="Fregatowa">Fregatowa</option>
                        <option value="Frycza-Modrzewskiego">Frycza-Modrzewskiego</option>
                        <option value="Galaktyczna">Galaktyczna</option>
                        <option value="Galeria Bałtycka">Galeria Bałtycka</option>
                        <option value="Galeria Szperk">Galeria Szperk</option>
                        <option value="Gdańska">Gdańska</option>
                        <option value="Gdańska - Zryw">Gdańska - "Zryw"</option>
                        <option value="Gdańska - Cmentarz">Gdańska - Cmentarz</option>
                        <option value="Gdańska - Kościół">Gdańska - Kościół</option>
                        <option value="Gdańska - Szkolna">Gdańska - Szkolna</option>
                        <option value="Gdynia Arena">Gdynia Arena</option>
                        <option value="Gdynia Dworzec Gł. PKP">Gdynia Dworzec Gł. PKP</option>
                        <option value="Gdynia Dworzec Gł. PKP - Dworcowa">Gdynia Dworzec Gł. PKP - Dworcowa
                        </option>
                        <option value="Gdynia Dworzec Gł. PKP - Hala">Gdynia Dworzec Gł. PKP - Hala</option>
                        <option value="Gdynia Dworzec Gł. PKP - Morska">Gdynia Dworzec Gł. PKP - Morska</option>
                        <option value="Gdynia Dworzec Gł. PKP - Wolności">Gdynia Dworzec Gł. PKP - Wolności
                        </option>
                        <option value="Gdynia Karwiny PKM">Gdynia Karwiny PKM</option>
                        <option value="Gdynia Nałkowskiej">Gdynia Nałkowskiej</option>
                        <option value="Gdynia Źródło Marii">Gdynia Źródło Marii</option>
                        <option value="Geodetów">Geodetów</option>
                        <option value="Gospody">Gospody</option>
                        <option value="Gostyńska Szpital">Gostyńska Szpital</option>
                        <option value="Goyki">Goyki</option>
                        <option value="Gołębia">Gołębia</option>
                        <option value="Gościnna">Gościnna</option>
                        <option value="Grabowo">Grabowo</option>
                        <option value="Grabowskiego">Grabowskiego</option>
                        <option value="Grabówek SKM">Grabówek SKM</option>
                        <option value="Gradowa">Gradowa</option>
                        <option value="Grand Hotel">Grand Hotel</option>
                        <option value="Grenadierów">Grenadierów</option>
                        <option value="Gronostajowa">Gronostajowa</option>
                        <option value="Grudziądzka">Grudziądzka</option>
                        <option value="Grunwaldzka">Grunwaldzka</option>
                        <option value="Grunwaldzka - Ceynowy">Grunwaldzka - Ceynowy</option>
                        <option value="Gruszkowa">Gruszkowa</option>
                        <option value="Gryfa Pomorskiego">Gryfa Pomorskiego</option>
                        <option value="Grzybowa">Grzybowa</option>
                        <option value="Góralska">Góralska</option>
                        <option value="Górecka">Górecka</option>
                        <option value="Górki Wschodnie">Górki Wschodnie</option>
                        <option value="Górki Zachodnie">Górki Zachodnie</option>
                        <option value="Górnicza">Górnicza</option>
                        <option value="Górnicza - Damroki">Górnicza - Damroki</option>
                        <option value="Górnicza - Kościół">Górnicza - Kościół</option>
                        <option value="Górskiego">Górskiego</option>
                        <option value="Gęsia">Gęsia</option>
                        <option value="Głucha">Głucha</option>
                        <option value="Głęboka">Głęboka</option>
                        <option value="Hala Makro">Hala "Makro"</option>
                        <option value="Hala Olivia">Hala "Olivia"</option>
                        <option value="Halicka">Halicka</option>
                        <option value="Hallera">Hallera</option>
                        <option value="Handlowa">Handlowa</option>
                        <option value="Harcerska">Harcerska</option>
                        <option value="Harfowa">Harfowa</option>
                        <option value="Helska">Helska</option>
                        <option value="Herberta">Herberta</option>
                        <option value="Hestii">Hestii</option>
                        <option value="Hevelianum">Hevelianum</option>
                        <option value="Hipermarket Tesco / OBI">Hipermarket Tesco / OBI</option>
                        <option value="Hokejowa">Hokejowa</option>
                        <option value="Hospicjum">Hospicjum</option>
                        <option value="Hotel Marina">Hotel "Marina"</option>
                        <option value="Hucisko">Hucisko</option>
                        <option value="Hutnicza - Działki">Hutnicza - Działki</option>
                        <option value="Hutnicza - Estakada">Hutnicza - Estakada</option>
                        <option value="Hutnicza - Piaskowa">Hutnicza - Piaskowa</option>
                        <option value="Hutnicza - Stacja Paliw Lotos">Hutnicza - Stacja Paliw Lotos</option>
                        <option value="Hynka">Hynka</option>
                        <option value="I Urząd Skarbowy">I Urząd Skarbowy</option>
                        <option value="II Urząd Skarbowy">II Urząd Skarbowy</option>
                        <option value="Ikara">Ikara</option>
                        <option value="Instal">Instal</option>
                        <option value="Instytut Med. Morskiej i Tropikalnej">Instytut Med. Morskiej i Tropikalnej
                        </option>
                        <option value="Inżynierska">Inżynierska</option>
                        <option value="Iławska">Iławska</option>
                        <option value="Jabłoniowa Osiedle">Jabłoniowa Osiedle</option>
                        <option value="Jagiellońska">Jagiellońska</option>
                        <option value="Jagiełły">Jagiełły</option>
                        <option value="Jana Pawła II">Jana Pawła II</option>
                        <option value="Jana z Kolna [GDA]">Jana z Kolna [GDA]</option>
                        <option value="Jana z Kolna [SOP]">Jana z Kolna [SOP]</option>
                        <option value="Janka Wiśniewskiego">Janka Wiśniewskiego</option>
                        <option value="Jankowo">Jankowo</option>
                        <option value="Janowo SKM">Janowo SKM</option>
                        <option value="Janowo SKM - Sobieskiego">Janowo SKM - Sobieskiego</option>
                        <option value="Jarowa">Jarowa</option>
                        <option value="Jasia i Małgosi">Jasia i Małgosi</option>
                        <option value="Jasień Działki">Jasień Działki</option>
                        <option value="Jasień PKM">Jasień PKM</option>
                        <option value="Jasień Pólnicy">Jasień Pólnicy</option>
                        <option value="Jasieńska">Jasieńska</option>
                        <option value="Jaskółcza">Jaskółcza</option>
                        <option value="Jaworowa">Jaworowa</option>
                        <option value="Jaworzniaków">Jaworzniaków</option>
                        <option value="Jałowcowa">Jałowcowa</option>
                        <option value="Jaśkowa Dolina">Jaśkowa Dolina</option>
                        <option value="Jednorożca">Jednorożca</option>
                        <option value="Jeleniogórska">Jeleniogórska</option>
                        <option value="Jelitkowo">Jelitkowo</option>
                        <option value="Jelitkowo Kapliczna">Jelitkowo Kapliczna</option>
                        <option value="Jesionowa">Jesionowa</option>
                        <option value="Jeziorna">Jeziorna</option>
                        <option value="Jeziorowa">Jeziorowa</option>
                        <option value="Jodowa">Jodowa</option>
                        <option value="Junaków">Junaków</option>
                        <option value="Jęczmienna">Jęczmienna</option>
                        <option value="Kacze Buki">Kacze Buki</option>
                        <option value="Kacze Buki Puszczyka">Kacze Buki Puszczyka</option>
                        <option value="Kaczeńce">Kaczeńce</option>
                        <option value="Kaczeńce - Sienna">Kaczeńce - Sienna</option>
                        <option value="Kadmowa">Kadmowa</option>
                        <option value="Kalksztajnów">Kalksztajnów</option>
                        <option value="Kalksztajnów - Bloki">Kalksztajnów - Bloki</option>
                        <option value="Kameliowa">Kameliowa</option>
                        <option value="Kamienna Grobla">Kamienna Grobla</option>
                        <option value="Kamienny Potok - Kościół">Kamienny Potok - Kościół</option>
                        <option value="Kamienny Potok - Kujawska">Kamienny Potok - Kujawska</option>
                        <option value="Kamienny Potok SKM">Kamienny Potok SKM</option>
                        <option value="Kamień">Kamień</option>
                        <option value="Kamień - Asnyka">Kamień - Asnyka</option>
                        <option value="Kampinoska">Kampinoska</option>
                        <option value="Kamrowskiego">Kamrowskiego</option>
                        <option value="Kanał Leniwy">Kanał Leniwy</option>
                        <option value="Kanałowa">Kanałowa</option>
                        <option value="Kapitańska">Kapitańska</option>
                        <option value="Karczemki - Tuchomska">Karczemki - Tuchomska</option>
                        <option value="Karczemki Szkoła">Karczemki Szkoła</option>
                        <option value="Karczemki [GDA]">Karczemki [GDA]</option>
                        <option value="Karczemki [SZ]">Karczemki [SZ]</option>
                        <option value="Karskiego">Karskiego</option>
                        <option value="Kartuska">Kartuska</option>
                        <option value="Karwieńska">Karwieńska</option>
                        <option value="Karwiny Nowowiczlińska">Karwiny Nowowiczlińska</option>
                        <option value="Karwiny PKM">Karwiny PKM</option>
                        <option value="Karwiny Tuwima">Karwiny Tuwima</option>
                        <option value="Kasprowicza (rondo)">Kasprowicza (rondo)</option>
                        <option value="Kasztanowa">Kasztanowa</option>
                        <option value="Kasztelańska">Kasztelańska</option>
                        <option value="Kazimierz - Kazimierska">Kazimierz - Kazimierska</option>
                        <option value="Kazimierz - Listopadowa">Kazimierz - Listopadowa</option>
                        <option value="Kazimierz - Majowa">Kazimierz - Majowa</option>
                        <option value="Kazimierz - Pętla">Kazimierz - Pętla</option>
                        <option value="Kazimierz - Rumska">Kazimierz - Rumska</option>
                        <option value="Kempingowa">Kempingowa</option>
                        <option value="Keplera">Keplera</option>
                        <option value="Kielecka">Kielecka</option>
                        <option value="Kieleńska Huta">Kieleńska Huta</option>
                        <option value="Kielno - Bożańska">Kielno - Bożańska</option>
                        <option value="Kielno - Cmentarz">Kielno - Cmentarz</option>
                        <option value="Kielno - Kościół">Kielno - Kościół</option>
                        <option value="Kielno - Rondo">Kielno - Rondo</option>
                        <option value="Kielno - Różana">Kielno - Różana</option>
                        <option value="Kielno - Sikorskiego">Kielno - Sikorskiego</option>
                        <option value="Kielno - Słoneczna">Kielno - Słoneczna</option>
                        <option value="Kielno - Tredera">Kielno - Tredera</option>
                        <option value="Kiełpinek">Kiełpinek</option>
                        <option value="Kiełpinek PKM">Kiełpinek PKM</option>
                        <option value="Kiełpino - Szkoła">Kiełpino - Szkoła</option>
                        <option value="Kiełpino Górne">Kiełpino Górne</option>
                        <option value="Kilińskiego [GDA]">Kilińskiego [GDA]</option>
                        <option value="Kilińskiego [GDY]">Kilińskiego [GDY]</option>
                        <option value="Kliniczna">Kliniczna</option>
                        <option value="Klonowa [GDA]">Klonowa [GDA]</option>
                        <option value="Klonowa [RU]">Klonowa [RU]</option>
                        <option value="Klonowicza">Klonowicza</option>
                        <option value="Kmicica">Kmicica</option>
                        <option value="Knyszyńska">Knyszyńska</option>
                        <option value="Kochanowskiego">Kochanowskiego</option>
                        <option value="Kokoszki">Kokoszki</option>
                        <option value="Kokoszki - Poczta">Kokoszki - Poczta</option>
                        <option value="Kolberga">Kolberga</option>
                        <option value="Kolbudzka">Kolbudzka</option>
                        <option value="Koleczkowo - Gryfa Pomorskiego">Koleczkowo - Gryfa Pomorskiego</option>
                        <option value="Koleczkowo - Kamieńska">Koleczkowo - Kamieńska</option>
                        <option value="Koleczkowo - Młyńska">Koleczkowo - Młyńska</option>
                        <option value="Koleczkowo - Poczta">Koleczkowo - Poczta</option>
                        <option value="Koleczkowo - Łąkowa">Koleczkowo - Łąkowa</option>
                        <option value="Kolibki">Kolibki</option>
                        <option value="Kolonia+Mysia">Kolonia Mysia</option>
                        <option value="Kolonia+Uroda">Kolonia Uroda</option>
                        <option value="Kolorowa">Kolorowa</option>
                        <option value="Kolumba">Kolumba</option>
                        <option value="Komandorska - Hotel">Komandorska - Hotel</option>
                        <option value="Komarowo">Komarowo</option>
                        <option value="Komary">Komary</option>
                        <option value="Konkordii">Konkordii</option>
                        <option value="Konopnickiej">Konopnickiej</option>
                        <option value="Kontenerowa">Kontenerowa</option>
                        <option value="Kopalniana">Kopalniana</option>
                        <option value="Kopeckiego">Kopeckiego</option>
                        <option value="Kopernika - Kościół">Kopernika - Kościół</option>
                        <option value="Kopernika - Partyzantów">Kopernika - Partyzantów</option>
                        <option value="Korczaka [GDA]">Korczaka [GDA]</option>
                        <option value="Korczaka [GDY]">Korczaka [GDY]</option>
                        <option value="Kordeckiego">Kordeckiego</option>
                        <option value="Korty Tenisowe">Korty Tenisowe</option>
                        <option value="Korzeniowskiego">Korzeniowskiego</option>
                        <option value="Kosakowo - Centrum Handlowe">Kosakowo - Centrum Handlowe</option>
                        <option value="Kosakowo - Centrum Sportowe">Kosakowo - Centrum Sportowe</option>
                        <option value="Kosakowo - Cmentarz - Brama
   Główna">Kosakowo - Cmentarz - Brama
                            Główna
                        </option>
                        <option value="Kosakowo - Cmentarz Komunalny">Kosakowo - Cmentarz Komunalny</option>
                        <option value="Kosakowo - Kościół">Kosakowo - Kościół</option>
                        <option value="Kosakowo - Krokusowa">Kosakowo - Krokusowa</option>
                        <option value="Kosakowo - Rumska">Kosakowo - Rumska</option>
                        <option value="Kosakowo - Staw">Kosakowo - Staw</option>
                        <option value="Kosakowo - Tulipanowa">Kosakowo - Tulipanowa</option>
                        <option value="Kosakowo - Urząd Gminy">Kosakowo - Urząd Gminy</option>
                        <option value="Kosakowo - Złote Piaski">Kosakowo - Złote Piaski</option>
                        <option value="Kosmonautów">Kosmonautów</option>
                        <option value="Koziorożca">Koziorożca</option>
                        <option value="Kołobrzeska">Kołobrzeska</option>
                        <option value="Kołłątaja">Kołłątaja</option>
                        <option value="Kościuszki">Kościuszki</option>
                        <option value="Kościuszki - Kosynierów">Kościuszki - Kosynierów</option>
                        <option value="Krasickiego">Krasickiego</option>
                        <option value="Kraszewskiego">Kraszewskiego</option>
                        <option value="Krofeya">Krofeya</option>
                        <option value="Krynicka">Krynicka</option>
                        <option value="Krzemowa [GDA]">Krzemowa [GDA]</option>
                        <option value="Krzemowa [GDY]">Krzemowa [GDY]</option>
                        <option value="Królewskie Wzgórze">Królewskie Wzgórze</option>
                        <option value="Kręta">Kręta</option>
                        <option value="Ku Ujściu">Ku Ujściu</option>
                        <option value="Kujawska [GDA]">Kujawska [GDA]</option>
                        <option value="Kujawska [RU]">Kujawska [RU]</option>
                        <option value="Kukawka">Kukawka</option>
                        <option value="Kurpiowska">Kurpiowska</option>
                        <option value="Kurpińskiego">Kurpińskiego</option>
                        <option value="Kusocińskiego">Kusocińskiego</option>
                        <option value="Kuśnierska">Kuśnierska</option>
                        <option value="Kwiatkowskiego">Kwiatkowskiego</option>
                        <option value="Kwiatkowskiej">Kwiatkowskiej</option>
                        <option value="Kwiatowa">Kwiatowa</option>
                        <option value="Kwidzyńska I">Kwidzyńska I</option>
                        <option value="Kwidzyńska II">Kwidzyńska II</option>
                        <option value="Kępna">Kępna</option>
                        <option value="Kłosowa">Kłosowa</option>
                        <option value="Latarnia Morska">Latarnia Morska</option>
                        <option value="Legionów">Lawendowe Wzgórze</option>
                        <option value="Lazurowa">Lazurowa</option>
                        <option value="Legionów">Legionów</option>
                        <option value="Lenartowicza">Lenartowicza</option>
                        <option value="Leszczynki I">Leszczynki I</option>
                        <option value="Leszczynki II">Leszczynki II</option>
                        <option value="Leszczynki SKM">Leszczynki SKM</option>
                        <option value="Leszczynowa">Leszczynowa</option>
                        <option value="Leszczyńskich">Leszczyńskich</option>
                        <option value="Leśna Góra">Leśna Góra</option>
                        <option value="Leśna Góra - Przychodnia">Leśna Góra - Przychodnia</option>
                        <option value="Leśna Polana">Leśna Polana</option>
                        <option value="Leśniczówka Rogulewo">Leśniczówka Rogulewo</option>
                        <option value="Leźnieńska">Leźnieńska</option>
                        <option value="Liceum Jezuitów">Liceum Jezuitów</option>
                        <option value="Lidzka">Lidzka</option>
                        <option value="Liliowa">Liliowa</option>
                        <option value="Lipowa [GDA]">Lipowa [GDA]</option>
                        <option value="Lipowa [GDY]">Lipowa [GDY]</option>
                        <option value="Lipuska">Lipuska</option>
                        <option value="Lubowidzka">Lubowidzka</option>
                        <option value="Lutycka">Lutycka</option>
                        <option value="Lwowska">Lwowska</option>
                        <option value="Maciejewicza">Maciejewicza</option>
                        <option value="Maciejkowa">Maciejkowa</option>
                        <option value="Maki">Maki</option>
                        <option value="Malczewskiego">Malczewskiego</option>
                        <option value="Marsa">Marsa</option>
                        <option value="Marszewska">Marszewska</option>
                        <option value="Marynarki Polskiej">Marynarki Polskiej</option>
                        <option value="Marynarska">Marynarska</option>
                        <option value="Maszynowa">Maszynowa</option>
                        <option value="Matarnia PKM">Matarnia PKM</option>
                        <option value="Matejki">Matejki</option>
                        <option value="Matemblewo">Matemblewo</option>
                        <option value="Mazowiecka">Mazowiecka</option>
                        <option value="Mazurska">Mazurska</option>
                        <option value="Maćkowy">Maćkowy</option>
                        <option value="Małkowo">Małkowo</option>
                        <option value="Małomiejska">Małomiejska</option>
                        <option value="Małopolska">Małopolska</option>
                        <option value="Mały Kack Sandomierska">Mały Kack Sandomierska</option>
                        <option value="Mały Kack Strzelców">Mały Kack Strzelców</option>
                        <option value="Mały Kack Łęczycka">Mały Kack Łęczycka</option>
                        <option value="Mechelinki - Przystań">Mechelinki - Przystań</option>
                        <option value="Meczet">Meczet</option>
                        <option value="Meissnera">Meissnera</option>
                        <option value="Meteorytowa">Meteorytowa</option>
                        <option value="Miałki Szlak">Miałki Szlak</option>
                        <option value="Michałki">Michałki</option>
                        <option value="Mickiewicza [GDA]">Mickiewicza [GDA]</option>
                        <option value="Mickiewicza [GDY]">Mickiewicza [GDY]</option>
                        <option value="Miedza">Miedza</option>
                        <option value="Mierosławskiego">Mierosławskiego</option>
                        <option value="Migowo">Migowo</option>
                        <option value="Mireckiego">Mireckiego</option>
                        <option value="Mireckiego (linia 102)">Mireckiego (linia 102)</option>
                        <option value="Miszewko">Miszewko</option>
                        <option value="Miszewko - Nowy Tuchom">Miszewko - Nowy Tuchom</option>
                        <option value="Miszewo">Miszewo</option>
                        <option value="Miszewo - Pępowo">Miszewo - Pępowo</option>
                        <option value="Miszewskiego">Miszewskiego</option>
                        <option value="Mjr Hubala">Mjr Hubala</option>
                        <option value="Mjr Słabego">Mjr Słabego</option>
                        <option value="Modra I">Modra I</option>
                        <option value="Modra II">Modra II</option>
                        <option value="Modra III">Modra III</option>
                        <option value="Modra IV">Modra IV</option>
                        <option value="Moniuszki">Moniuszki</option>
                        <option value="Montażystów">Montażystów</option>
                        <option value="Morska - Estakada">Morska - Estakada</option>
                        <option value="Morska - Kcyńska">Morska - Kcyńska</option>
                        <option value="Mostek">Mostek</option>
                        <option value="Mostostal">Mostostal</option>
                        <option value="Mostowa">Mostowa</option>
                        <option value="Mosty - Brzozowa">Mosty - Brzozowa</option>
                        <option value="Mosty - Ogrodowa">Mosty - Ogrodowa</option>
                        <option value="Mosty - Olchowa">Mosty - Olchowa</option>
                        <option value="Mosty - Szkoła">Mosty - Szkoła</option>
                        <option value="Mosty - Wierzbowa">Mosty - Wierzbowa</option>
                        <option value="Mosty - Wiązowa">Mosty - Wiązowa</option>
                        <option value="Muchowskiego">Muchowskiego</option>
                        <option value="Muzeum II Wojny Światowej">Muzeum II Wojny Światowej</option>
                        <option value="Muzeum Narodowe">Muzeum Narodowe</option>
                        <option value="Myśliborska">Myśliborska</option>
                        <option value="Myśliwska [GDA]">Myśliwska [GDA]</option>
                        <option value="Myśliwska [GDY]">Myśliwska [GDY]</option>
                        <option value="Młyńska">Młyńska</option>
                        <option value="Na Szańcach">Na Szańcach</option>
                        <option value="Na Wzgórzu">Na Wzgórzu</option>
                        <option value="Na Zaspę">Na Zaspę</option>
                        <option value="Nabrzeże Przemysłowe">Nabrzeże Przemysłowe</option>
                        <option value="Nad Jarem">Nad Jarem</option>
                        <option value="Nad Stawem">Nad Stawem</option>
                        <option value="Nadwiślańska">Nadwiślańska</option>
                        <option value="Nadwodna">Nadwodna</option>
                        <option value="Naftowa">Naftowa</option>
                        <option value="Nanice SKM - Kochanowskiego">Nanice SKM - Kochanowskiego</option>
                        <option value="Nanice SKM - Kociewska">Nanice SKM - Kociewska</option>
                        <option value="Napierskiego">Napierskiego</option>
                        <option value="Nasypowa">Nasypowa</option>
                        <option value="Nawigatorów">Nawigatorów</option>
                        <option value="Nałkowskiej">Nałkowskiej</option>
                        <option value="Necla">Necla</option>
                        <option value="Niedziałkowskiego">Niedziałkowskiego</option>
                        <option value="Niedźwiednik">Niedźwiednik</option>
                        <option value="Niegowska">Niegowska</option>
                        <option value="Niemcewicza">Niemcewicza</option>
                        <option value="Niepołomicka">Niepołomicka</option>
                        <option value="Niestępowo Szkoła">Niestępowo Szkoła</option>
                        <option value="Norblina">Norblina</option>
                        <option value="Norwida">Norwida</option>
                        <option value="Nowa">Nowa</option>
                        <option value="Nowa Gdańska">Nowa Gdańska</option>
                        <option value="Nowatorów">Nowatorów</option>
                        <option value="Nowe Ogrody">Nowe Ogrody</option>
                        <option value="Nowiny">Nowiny</option>
                        <option value="Nowogrodzka">Nowogrodzka</option>
                        <option value="Nowolipie">Nowolipie</option>
                        <option value="Nowowiejskiego">Nowowiejskiego</option>
                        <option value="Nowy Port Oliwska">Nowy Port Oliwska</option>
                        <option value="Nowy Port Szaniec Zachodni">Nowy Port Szaniec Zachodni</option>
                        <option value="Nowy Port Zajezdnia">Nowy Port Zajezdnia</option>
                        <option value="Nowy Świat">Nowy Świat</option>
                        <option value="Obrońców Helu">Obrońców Helu</option>
                        <option value="Obrońców Westerplatte">Obrońców Westerplatte</option>
                        <option value="Obrońców Wybrzeża">Obrońców Wybrzeża</option>
                        <option value="Obwodowa">Obwodowa</option>
                        <option value="Obłuże Centrum">Obłuże Centrum</option>
                        <option value="Obłuże Maciejewicza">Obłuże Maciejewicza</option>
                        <option value="Oczyszczalnia">Oczyszczalnia</option>
                        <option value="Odrzańska">Odrzańska</option>
                        <option value="Odyseusza">Odyseusza</option>
                        <option value="Ogrodowa">Ogrodowa</option>
                        <option value="Ogrody Działkowe Rębiechowo">Ogrody Działkowe "Rębiechowo" I
                        </option>
                        <option value="Ogrody Działkowe Rębiechowo II">Ogrody Działkowe "Rębiechowo"II</option>
                        <option value="Ogrody Działkowe Rębiechowo III">Ogrody Działkowe "Rębiechowo" III</option>
                        <option value="Ogród Botaniczny Marszewo">Ogród Botaniczny Marszewo</option>
                        <option value="Okopowa">Okopowa</option>
                        <option value="Okrzei">Okrzei</option>
                        <option value="Okrężna">Okrężna</option>
                        <option value="Okrężna I">Okrężna I</option>
                        <option value="Okrężna II">Okrężna II</option>
                        <option value="Oksywie Dickmana">Oksywie Dickmana</option>
                        <option value="Oksywie Dolne">Oksywie Dolne</option>
                        <option value="Oksywie Godebskiego">Oksywie Godebskiego</option>
                        <option value="Oksywie Górne">Oksywie Górne</option>
                        <option value="Olgierda">Olgierda</option>
                        <option value="Olimpijska">Olimpijska</option>
                        <option value="Oliwa - Pętla Tramwajowa">Oliwa - Pętla Tramwajowa</option>
                        <option value="Oliwa PKP">Oliwa PKP</option>
                        <option value="Oliwa ZOO">Oliwa ZOO</option>
                        <option value="Olkuska - Radomska">Olkuska - Radomska</option>
                        <option value="Olkuska - Łowicka">Olkuska - Łowicka</option>
                        <option value="Olsztyńska">Olsztyńska</option>
                        <option value="Olszynka - Niwki">Olszynka - Niwki</option>
                        <option value="Olszynka - Szkoła">Olszynka - Szkoła</option>
                        <option value="Olszyńska">Olszyńska</option>
                        <option value="Opacka">Opacka</option>
                        <option value="Opera Bałtycka">Opera Bałtycka</option>
                        <option value="Opolska">Opolska</option>
                        <option value="Oriona">Oriona</option>
                        <option value="Orlinki">Orlinki</option>
                        <option value="Ornitologów">Ornitologów</option>
                        <option value="Orunia Górna">Orunia Górna</option>
                        <option value="Orłowo SKM - Klif">Orłowo SKM - "Klif"</option>
                        <option value="Orłowo SKM - Orłowska">Orłowo SKM - Orłowska</option>
                        <option value="Osiedle Barniewice">Osiedle Barniewice</option>
                        <option value="Osiedle Bursztynowe">Osiedle Bursztynowe</option>
                        <option value="Osiedle Cytrusowe">Osiedle Cytrusowe</option>
                        <option value="Osiedle Jary">Osiedle Jary</option>
                        <option value="Osiedle Kasprowicza">Osiedle Kasprowicza</option>
                        <option value="Osiedle Królewskie">Osiedle Królewskie</option>
                        <option value="Osiedle Mickiewicza">Osiedle Mickiewicza</option>
                        <option value="Osiedle Olimp">Osiedle Olimp</option>
                        <option value="Osiedle Piastowskie">Osiedle Piastowskie</option>
                        <option value="Osiedle Wejhera">Osiedle Wejhera</option>
                        <option value="Osiedle Wschód">Osiedle Wschód</option>
                        <option value="Osiedle Świętokrzyskie">Osiedle Świętokrzyskie</option>
                        <option value="Osowa Obwodnica">Osowa Obwodnica</option>
                        <option value="Osowa PKP">Osowa PKP</option>
                        <option value="Osowa Przesypownia">Osowa Przesypownia</option>
                        <option value="Ostroroga">Ostroroga</option>
                        <option value="Ostróżek">Ostróżek</option>
                        <option value="Otomin - Pętla">Otomin - Pętla</option>
                        <option value="Otomińska">Otomińska</option>
                        <option value="Otwarta">Otwarta</option>
                        <option value="Owczarnia">Owczarnia</option>
                        <option value="Owsiana">Owsiana</option>
                        <option value="PCK">PCK</option>
                        <option value="Paderewskiego">Paderewskiego</option>
                        <option value="Pagórkowa">Pagórkowa</option>
                        <option value="Panattoni">Panattoni</option>
                        <option value="Pancerna">Pancerna</option>
                        <option value="Paprykowa">Paprykowa</option>
                        <option value="Park Naukowo - Technologiczny">Park Naukowo - Technologiczny</option>
                        <option value="Park Rady Europy">Park Rady Europy</option>
                        <option value="Park Reagana">Park Reagana</option>
                        <option value="Partyzantów - Kościuszki">Partyzantów - Kościuszki</option>
                        <option value="Paska">Paska</option>
                        <option value="Pastelowa">Pastelowa</option>
                        <option value="Piaskowa">Piaskowa</option>
                        <option value="Piastowska">Piastowska</option>
                        <option value="Piecewska">Piecewska</option>
                        <option value="Piekarnicza">Piekarnicza</option>
                        <option value="Pieleszewo SKM">Pieleszewo SKM</option>
                        <option value="Pierwoszyno - Kościół">Pierwoszyno - Kościół</option>
                        <option value="Pierwoszyno - Staw">Pierwoszyno - Staw</option>
                        <option value="Pieńkawy">Pieńkawy</option>
                        <option value="Pilotów">Pilotów</option>
                        <option value="Piotrkowska">Piotrkowska</option>
                        <option value="Piołunowa">Piołunowa</option>
                        <option value="Piłsudskiego">Piłsudskiego</option>
                        <option value="Plac Afrodyty">Plac Afrodyty</option>
                        <option value="Plac Górnośląski">Plac Górnośląski</option>
                        <option value="Plac Kaszubski">Plac Kaszubski</option>
                        <option value="Plac Kaszubski - Jana z Kolna">Plac Kaszubski - Jana z Kolna</option>
                        <option value="Plac Kaszubski - Świętojańska">Plac Kaszubski - Świętojańska
                        </option>
                        <option value="Plac Komorowskiego">Plac Komorowskiego</option>
                        <option value="Plac Kusocińskiego">Plac Kusocińskiego</option>
                        <option value="Plac Neptuna">Plac Neptuna</option>
                        <option value="Plac Solidarności">Plac Solidarności</option>
                        <option value="Plac Wolności">Plac Wolności</option>
                        <option value="Platynowa">Platynowa</option>
                        <option value="Plaża Śródmieście - Muzeum Miasta Gdyni">Plaża Śródmieście - Muzeum Miasta Gdyni</option>
                        <option value="Pocztowa">Pocztowa</option>
                        <option value="Podgórska">Podgórska</option>
                        <option value="Podkarpacka">Podkarpacka</option>
                        <option value="Podleśna">Podleśna</option>
                        <option value="Podmokła">Podmokła</option>
                        <option value="Pogotowie Ratunkowe">Pogotowie Ratunkowe</option>
                        <option value="Pogórze - Derdowskiego">Pogórze - Derdowskiego</option>
                        <option value="Pogórze - Dobke">Pogórze - Dobke</option>
                        <option value="Pogórze - Herbert">Pogórze - Herberta</option>
                        <option value="Pogórze - Majakowskiego">Pogórze - Majakowskiego</option>
                        <option value="Pogórze - Pogórze Górne">Pogórze - Pogórze Górne</option>
                        <option value="Pogórze - Pułaskiego">Pogórze - Pułaskiego</option>
                        <option value="Pogórze - Szkolna">Pogórze - Szkolna</option>
                        <option value="Pogórze - Słowackiego">Pogórze - Słowackiego</option>
                        <option value="Pogórze Dolne">Pogórze Dolne</option>
                        <option value="Pogórze Dolne Złota">Pogórze Dolne Złota</option>
                        <option value="Pogórze Górne">Pogórze Górne</option>
                        <option value="Pohulanka">Pohulanka</option>
                        <option value="Pokładowa">Pokładowa</option>
                        <option value="Pole Namiotowe">Pole Namiotowe</option>
                        <option value="Politechnika">Politechnika</option>
                        <option value="Politechnika SKM">Politechnika SKM</option>
                        <option value="Polna">Polna</option>
                        <option value="Pomorska - Gdańska">Pomorska - Gdańska</option>
                        <option value="Pomorska - Osiedle">Pomorska - Osiedle</option>
                        <option value="Pomorska [GDA]">Pomorska [GDA]</option>
                        <option value="Pomorska [RU]">Pomorska [RU]</option>
                        <option value="Pomorskie Szkoły Rzemiosł">Pomorskie Szkoły Rzemiosł</option>
                        <option value="Porazińskiej">Porazińskiej</option>
                        <option value="Port Lotniczy">Port Lotniczy</option>
                        <option value="Portowa">Portowa</option>
                        <option value="Porębskiego">Porębskiego</option>
                        <option value="Potok Wiczliński">Potok Wiczliński</option>
                        <option value="Potokowa">Potokowa</option>
                        <option value="Potokowa - Matemblewska">Potokowa - Matemblewska</option>
                        <option value="Potęgowska">Potęgowska</option>
                        <option value="Powstań Chłopskich">Powstań Chłopskich</option>
                        <option value="Powstańców Warszawskich">Powstańców Warszawskich</option>
                        <option value="Powstańców Warszawy">Powstańców Warszawy</option>
                        <option value="Poznańska">Poznańska</option>
                        <option value="Połczyńska">Połczyńska</option>
                        <option value="Prusa">Prusa</option>
                        <option value="Pruszcz Gdański Słowackiego">Pruszcz Gdański Słowackiego</option>
                        <option value="Pruszkowskiego">Pruszkowskiego</option>
                        <option value="Przebiśniegowa">Przebiśniegowa</option>
                        <option value="Przegalina">Przegalina</option>
                        <option value="Przegalińska">Przegalińska</option>
                        <option value="Przegalińska - Schronisko">Przegalińska - Schronisko</option>
                        <option value="Przejazd Kolejowy">Przejazd Kolejowy</option>
                        <option value="Przemian">Przemian</option>
                        <option value="Przemyska">Przemyska</option>
                        <option value="Przemysłowa">Przemysłowa</option>
                        <option value="Przeróbka">Przeróbka</option>
                        <option value="Przesypownia">Przesypownia</option>
                        <option value="Przetoczna">Przetoczna</option>
                        <option value="Przybrzeżna">Przybrzeżna</option>
                        <option value="Przychodnia">Przychodnia</option>
                        <option value="Przylesie">Przylesie</option>
                        <option value="Przymorze SKM">Przymorze SKM</option>
                        <option value="Przymorze Wielkie">Przymorze Wielkie</option>
                        <option value="Przyrodników">Przyrodników</option>
                        <option value="Przyrzeczna">Przyrzeczna</option>
                        <option value="Przystań">Przystań</option>
                        <option value="Przystań Żeglugi">Przystań Żeglugi</option>
                        <option value="Przytulna">Przytulna</option>
                        <option value="Przywidzka">Przywidzka</option>
                        <option value="Pszenna">Pszenna</option>
                        <option value="Ptasia">Ptasia</option>
                        <option value="Pucka">Pucka</option>
                        <option value="Pucka - Hutnicza">Pucka - Hutnicza</option>
                        <option value="Pucka - Przejazd Kolejowy">Pucka - Przejazd Kolejowy</option>
                        <option value="Pustki Cisowskie">Pustki Cisowskie</option>
                        <option value="Pólnicy">Pólnicy</option>
                        <option value="Pępowo">Pępowo</option>
                        <option value="Płocka">Płocka</option>
                        <option value="Płowce">Płowce</option>
                        <option value="Płońska">Płońska</option>
                        <option value="Płyta Redłowska">Płyta Redłowska</option>
                        <option value="Racławicka">Racławicka</option>
                        <option value="Radarowa">Radarowa</option>
                        <option value="Radiowa">Radiowa</option>
                        <option value="Radunica">Radunica</option>
                        <option value="Raduńska">Raduńska</option>
                        <option value="Rafineria">Rafineria</option>
                        <option value="Rakietowa">Rakietowa</option>
                        <option value="Rdestowa - Chwaszczyńska">Rdestowa - Chwaszczyńska</option>
                        <option value="Rdestowa - Leśny Zakątek">Rdestowa - Leśny Zakątek</option>
                        <option value="Reda Aquapark">Reda Aquapark</option>
                        <option value="Reda Dworzec PKP">Reda Dworzec PKP</option>
                        <option value="Redłowo SKM">Redłowo SKM</option>
                        <option value="Redłowo SKM - Park Technologiczny">Redłowo SKM - Park Technologiczny
                        </option>
                        <option value="Redłowo Szpital">Redłowo Szpital</option>
                        <option value="Reformacka">Reformacka</option>
                        <option value="Reja [GDA]">Reja [GDA]</option>
                        <option value="Reja [RU]">Reja [RU]</option>
                        <option value="Rejenta">Rejenta</option>
                        <option value="Rejtana">Rejtana</option>
                        <option value="Rewa - Bosmańska">Rewa - Bosmańska</option>
                        <option value="Rewa - Bursztynowa">Rewa - Bursztynowa</option>
                        <option value="Rewa - Słoneczna">Rewa - Słoneczna</option>
                        <option value="Rewa - Wrocławska">Rewa - Wrocławska</option>
                        <option value="Reymonta [GDA]">Reymonta [GDA]</option>
                        <option value="Reymonta [PG]">Reymonta [PG]</option>
                        <option value="Rogalińska">Rogalińska</option>
                        <option value="Rogozińskiego">Rogozińskiego</option>
                        <option value="Rolnicza">Rolnicza</option>
                        <option value="Rondo Bursztynowe">Rondo Bursztynowe</option>
                        <option value="Rondo Jana Pawła II">Rondo Jana Pawła II</option>
                        <option value="Rondo Kaszubskie">Rondo Kaszubskie</option>
                        <option value="Rondo Kociewskie">Rondo Kociewskie</option>
                        <option value="Rotmanka - Rondo">Rotmanka - Rondo</option>
                        <option value="Rotterdamska">Rotterdamska</option>
                        <option value="Rozewska">Rozewska</option>
                        <option value="Rozstaje">Rozstaje</option>
                        <option value="Rozłogi">Rozłogi</option>
                        <option value="Ruchu Oporu">Ruchu Oporu</option>
                        <option value="Rumia Dworzec PKP">Rumia Dworzec PKP</option>
                        <option value="Rumia Dworzec PKP - Towarowa">Rumia Dworzec PKP - Towarowa</option>
                        <option value="Rumia Partyzantów">Rumia Partyzantów</option>
                        <option value="Rumia Szmelta">Rumia Szmelta</option>
                        <option value="Rybacka [GDA]">Rybacka [GDA]</option>
                        <option value="Rybacka [WEJ]">Rybacka [WEJ]</option>
                        <option value="Rybaki Górne">Rybaki Górne</option>
                        <option value="Rybińskiego">Rybińskiego</option>
                        <option value="Rybołowców">Rybołowców</option>
                        <option value="Rynarzewo">Rynarzewo</option>
                        <option value="Rynek Non-Stop">Rynek Non-Stop</option>
                        <option value="Rzeczypospolitej">Rzeczypospolitej</option>
                        <option value="Równa">Równa</option>
                        <option value="Rębiechowo PKP">Rębiechowo PKP</option>
                        <option value="Rębiechowo Piaskowa">Rębiechowo Piaskowa</option>
                        <option value="Rębowo">Rębowo</option>
                        <option value="SDO Złota Jesień">SDO "Złota Jesień"</option>
                        <option value="Sabata - Szkoła">Sabata - Szkoła</option>
                        <option value="Sambora">Sambora</option>
                        <option value="Sanatorium Leśnik">Sanatorium "Leśnik"</option>
                        <option value="Sandomierska">Sandomierska</option>
                        <option value="Sarnia">Sarnia</option>
                        <option value="Saturna">Saturna</option>
                        <option value="Schronisko Sopotkowo">Schronisko Sopotkowo</option>
                        <option value="Schronisko dla zwierząt Promyk">Schronisko dla zwierząt "Promyk"
                        </option>
                        <option value="Schuberta">Schuberta</option>
                        <option value="Schumana">Schumana</option>
                        <option value="Sea Towers">Sea Towers</option>
                        <option value="Sezonowa">Sezonowa</option>
                        <option value="Siedlce">Siedlce</option>
                        <option value="Siedleckiego">Siedleckiego</option>
                        <option value="Siedlicka">Siedlicka</option>
                        <option value="Sienkiewicza [PG]">Sienkiewicza [PG]</option>
                        <option value="Sienkiewicza [SOP]">Sienkiewicza [SOP]</option>
                        <option value="Siennicka">Siennicka</option>
                        <option value="Sierpowa">Sierpowa</option>
                        <option value="Sikorskiego [GDA]">Sikorskiego [GDA]</option>
                        <option value="Sikorskiego [GDY]">Sikorskiego [GDY]</option>
                        <option value="Sikorskiego [SOP]">Sikorskiego [SOP]</option>
                        <option value="Skarbka I">Skarbka I</option>
                        <option value="Skarbka II">Skarbka II</option>
                        <option value="Skarżyńskiego">Skarżyńskiego</option>
                        <option value="Skrajna">Skrajna</option>
                        <option value="Skwer Kościuszki - InfoBox">Skwer Kościuszki - InfoBox</option>
                        <option value="Smolna">Smolna</option>
                        <option value="Smoluchowskiego">Smoluchowskiego</option>
                        <option value="Smęgorzyno">Smęgorzyno</option>
                        <option value="Sobieskiego - FUO">Sobieskiego - FUO</option>
                        <option value="Sobieskiego - Przychodnia">Sobieskiego - Przychodnia</option>
                        <option value="Sobieszewko">Sobieszewko</option>
                        <option value="Sobieszewko Ośrodek">Sobieszewko Ośrodek</option>
                        <option value="Sobieszewo">Sobieszewo</option>
                        <option value="Sobieszewska">Sobieszewska</option>
                        <option value="Sobieszewska Pastwa 1">Sobieszewska Pastwa 1</option>
                        <option value="Sobieszewska Pastwa 2">Sobieszewska Pastwa 2</option>
                        <option value="Sobótki">Sobótki</option>
                        <option value="Sokoła">Sokoła</option>
                        <option value="Soplicy">Soplicy</option>
                        <option value="Sopocka">Sopocka</option>
                        <option value="Sopot 3 Maja (N/Ż)">Sopot 3 Maja (N/Ż)</option>
                        <option value="Sopot Brodwino (N/Ż)">Sopot Brodwino (N/Ż)</option>
                        <option value="Sopot Brodwino Szkoła (N/Ż)">Sopot Brodwino Szkoła (N/Ż)</option>
                        <option value="Sopot Goyki">Sopot Goyki</option>
                        <option value="Sopot Junaków (N/Ż)">Sopot Junaków (N/Ż)</option>
                        <option value="Sopot Kasztanowa">Sopot Kasztanowa</option>
                        <option value="Sopot Kolberga (N/Ż)">Sopot Kolberga (N/Ż)</option>
                        <option value="Sopot Kraszewskiego (N/Ż)">Sopot Kraszewskiego (N/Ż)</option>
                        <option value="Sopot Malczewskiego">Sopot Malczewskiego</option>
                        <option value="Sopot Małopolska (N/Ż)">Sopot Małopolska (N/Ż)</option>
                        <option value="Sopot PKP">Sopot PKP</option>
                        <option value="Sopot PKP - Marynarzy">Sopot PKP - Marynarzy</option>
                        <option value="Sopot PKP - Niepodległości">Sopot PKP - Niepodległości</option>
                        <option value="Sopot Reja">Sopot Reja</option>
                        <option value="Sosnowiecka">Sosnowiecka</option>
                        <option value="Sołdka">Sołdka</option>
                        <option value="Spadochroniarzy">Spadochroniarzy</option>
                        <option value="Spokojna - Cmentarz">Spokojna - Cmentarz</option>
                        <option value="Sportowa [GDA]">Sportowa [GDA]</option>
                        <option value="Sportowa [SOP]">Sportowa [SOP]</option>
                        <option value="Srebrna">Srebrna</option>
                        <option value="Stadion">Stadion</option>
                        <option value="Stadion Miejski">Stadion Miejski</option>
                        <option value="Stadion PKM">Stadion PKM</option>
                        <option value="Staniewicza">Staniewicza</option>
                        <option value="Staniszewskiego">Staniszewskiego</option>
                        <option value="Stara Piła">Stara Piła</option>
                        <option value="Stara Rumia Cmentarz">Stara Rumia Cmentarz</option>
                        <option value="Stare Obłuże">Stare Obłuże</option>
                        <option value="Stare Szkoty">Stare Szkoty</option>
                        <option value="Starochwaszczyńska">Starochwaszczyńska</option>
                        <option value="Starogardzka">Starogardzka</option>
                        <option value="Starowiejska - Poczta">Starowiejska - Poczta</option>
                        <option value="Starowiejska [GDA]">Starowiejska [GDA]</option>
                        <option value="Starowiejska [GDY]">Starowiejska [GDY]</option>
                        <option value="Startowa">Startowa</option>
                        <option value="Staw Wróbla">Staw Wróbla</option>
                        <option value="Stawna">Stawna</option>
                        <option value="Steczka">Steczka</option>
                        <option value="Sternicza">Sternicza</option>
                        <option value="Steyera">Steyera</option>
                        <option value="Stocznia Gdynia">Stocznia Gdynia</option>
                        <option value="Stocznia Północna">Stocznia Północna</option>
                        <option value="Stocznia SKM">Stocznia SKM</option>
                        <option value="Stocznia SKM - Morska">Stocznia SKM - Morska</option>
                        <option value="Stocznia Wojenna">Stocznia Wojenna</option>
                        <option value="Stoczniowców">Stoczniowców</option>
                        <option value="Stogi">Stogi</option>
                        <option value="Stogi Plaża">Stogi Plaża</option>
                        <option value="Stoigniewa">Stoigniewa</option>
                        <option value="Stokrotki">Stokrotki</option>
                        <option value="Stokłosy">Stokłosy</option>
                        <option value="Stolarska">Stolarska</option>
                        <option value="Stolema">Stolema</option>
                        <option value="Strzelecka">Strzelecka</option>
                        <option value="Strzelnica">Strzelnica</option>
                        <option value="Strzyża PKM">Strzyża PKM</option>
                        <option value="Stężycka">Stężycka</option>
                        <option value="Subisława">Subisława</option>
                        <option value="Suchanino">Suchanino</option>
                        <option value="Sucharskiego">Sucharskiego</option>
                        <option value="Sucharskiego - PKP">Sucharskiego - PKP</option>
                        <option value="Suchy Dwór - Borchardta">Suchy Dwór - Borchardta</option>
                        <option value="Suchy Dwór - Gombrowicza">Suchy Dwór - Gombrowicza</option>
                        <option value="Suchy Dwór - Kochanowskiego">Suchy Dwór - Kochanowskiego</option>
                        <option value="Suchy Dwór - Necla">Suchy Dwór - Necla</option>
                        <option value="Suchy Dwór - Reja">Suchy Dwór - Reja</option>
                        <option value="Suchy Dwór - Szkolna">Suchy Dwór - Szkolna</option>
                        <option value="Sulmin">Sulmin</option>
                        <option value="Sulmińska">Sulmińska</option>
                        <option value="Swarzewska I">Swarzewska I</option>
                        <option value="Swarzewska II">Swarzewska II</option>
                        <option value="Swojska">Swojska</option>
                        <option value="Szadółki">Szadółki</option>
                        <option value="Szadółki Obwodnica">Szadółki Obwodnica</option>
                        <option value="Szafranowa">Szafranowa</option>
                        <option value="Szczeblewskiego">Szczeblewskiego</option>
                        <option value="Szczecińska">Szczecińska</option>
                        <option value="Szczęśliwa">Szczęśliwa</option>
                        <option value="Szemud">Szemud</option>
                        <option value="Szemud - Błaszkowskiego">Szemud - Błaszkowskiego</option>
                        <option value="Szemud - Cmentarz">Szemud - Cmentarz</option>
                        <option value="Szemud - Lesiniec">Szemud - Lesiniec</option>
                        <option value="Szemud - Moczydła">Szemud - Moczydła</option>
                        <option value="Szemud - Remiza">Szemud - Remiza</option>
                        <option value="Szkolna">Szkolna</option>
                        <option value="Szkoła Metropolitalna">Szkoła Metropolitalna</option>
                        <option value="Szkoła Morska">Szkoła Morska</option>
                        <option value="Szkoła Podstawowa nr 6">Szkoła Podstawowa nr 6</option>
                        <option value="Szlachecka">Szlachecka</option>
                        <option value="Szpital Marynarki Wojennej">Szpital Marynarki Wojennej</option>
                        <option value="Szpital Zakaźny">Szpital Zakaźny</option>
                        <option value="Sztutowska">Sztutowska</option>
                        <option value="Szybowcowa">Szybowcowa</option>
                        <option value="Sówki">Sówki</option>
                        <option value="Sąsiedzka">Sąsiedzka</option>
                        <option value="Słowackiego">Słowackiego</option>
                        <option value="Słowackiego Działki">Słowackiego Działki</option>
                        <option value="Tarcice">Tarcice</option>
                        <option value="Tatrzańska - Olsztyńska">Tatrzańska - Olsztyńska</option>
                        <option value="Teatr Miniatura / Radio Gdańsk">Teatr Miniatura / Radio Gdańsk</option>
                        <option value="Technikum Chłodnicze">Technikum Chłodnicze</option>
                        <option value="Telewizyjna">Telewizyjna</option>
                        <option value="Terminal - Cargo">Terminal - Cargo</option>
                        <option value="Terminal DCT">Terminal DCT</option>
                        <option value="Terminal Promowy">Terminal Promowy</option>
                        <option value="Tetmajera">Tetmajera</option>
                        <option value="Tezeusza">Tezeusza</option>
                        <option value="Topazowa">Topazowa</option>
                        <option value="Toruńska">Toruńska</option>
                        <option value="Trakt Gdański">Trakt Gdański</option>
                        <option value="Trakt Konny">Trakt Konny</option>
                        <option value="Transportowców">Transportowców</option>
                        <option value="Traugutta">Traugutta</option>
                        <option value="Traugutta [GDA]">Traugutta [GDA]</option>
                        <option value="Traugutta [GDY]">Traugutta [GDY]</option>
                        <option value="Trawki">Trawki</option>
                        <option value="Trałowa - Szkoła">Trałowa - Szkoła</option>
                        <option value="Tuchom - Ogrodowa">Tuchom - Ogrodowa</option>
                        <option value="Tuchom - Tęczowa">Tuchom - Tęczowa</option>
                        <option value="Tuchom - Warzenko">Tuchom - Warzenko</option>
                        <option value="Turkusowa">Turkusowa</option>
                        <option value="Turystyczna">Turystyczna</option>
                        <option value="Twarda">Twarda</option>
                        <option value="Tymiankowa">Tymiankowa</option>
                        <option value="Tysiąclecia">Tysiąclecia</option>
                        <option value="Tęczowa">Tęczowa</option>
                        <option value="Uczniowska [GDA]">Uczniowska [GDA]</option>
                        <option value="Uczniowska [GDY]">Uczniowska [GDY]</option>
                        <option value="Ugory eMOCja">Ugory eMOCja</option>
                        <option value="Ujeścisko">Ujeścisko</option>
                        <option value="Ukośna">Ukośna</option>
                        <option value="Unimor">Unimor</option>
                        <option value="Uniwersyteckie Centrum Kliniczne">Uniwersyteckie Centrum Kliniczne</option>
                        <option value="Uniwersytet Gdański [GDA]">Uniwersytet Gdański [GDA]</option>
                        <option value="Uniwersytet Gdański [SOP]">Uniwersytet Gdański [SOP]</option>
                        <option value="Uniwersytet Medyczny">Uniwersytet Medyczny</option>
                        <option value="Uniwersytet Morski">Uniwersytet Morski</option>
                        <option value="Uniwersytet Morski (linia 102)">Uniwersytet Morski (linia 102)</option>
                        <option value="Uphagena">Uphagena</option>
                        <option value="Uranowa">Uranowa</option>
                        <option value="Urząd Dozoru Technicznego">Urząd Dozoru Technicznego</option>
                        <option value="Urząd Miasta - Władysława IV">Urząd Miasta - Władysława IV
                        </option>
                        <option value="Urząd Miasta - Świętojańska">Urząd Miasta - Świętojańska
                        </option>
                        <option value="Urząd Miasta Rumi">Urząd Miasta Rumi</option>
                        <option value="Urząd Miejski">Urząd Miejski</option>
                        <option value="Urząd Morski">Urząd Morski</option>
                        <option value="Urząd Pracy">Urząd Pracy</option>
                        <option value="Urząd Skarbowy">Urząd Skarbowy</option>
                        <option value="Urząd Wojewódzki / Marszałkowski">Urząd Wojewódzki /
                            Marszałkowski
                        </option>
                        <option value="Uzdrowiskowa">Uzdrowiskowa</option>
                        <option value="Wagnera">Wagnera</option>
                        <option value="Waląga">Waląga</option>
                        <option value="Warneńska">Warneńska</option>
                        <option value="Warszawska">Warszawska</option>
                        <option value="Wały Piastowskie">Wały Piastowskie</option>
                        <option value="Wczasy">Wczasy</option>
                        <option value="Wejherowo Szpital">Wejherowo Szpital</option>
                        <option value="Wejherowska">Wejherowska</option>
                        <option value="Westerplatte">Westerplatte</option>
                        <option value="Wiczlino Działki I">Wiczlino Działki I</option>
                        <option value="Wiczlino Działki II">Wiczlino Działki II</option>
                        <option value="Wiczlino Niemotowo">Wiczlino Niemotowo</option>
                        <option value="Wiczlino Skrzyżowanie">Wiczlino Skrzyżowanie</option>
                        <option value="Wiczlińska - Las">Wiczlińska - Las</option>
                        <option value="Wiczlińska - Śliska">Wiczlińska - Śliska</option>
                        <option value="Wiejska">Wiejska</option>
                        <option value="Wielki Kack Fikakowo">Wielki Kack Fikakowo</option>
                        <option value="Wielki Kack Starodworcowa">Wielki Kack Starodworcowa</option>
                        <option value="Wieluńska - Lipnowska">Wieluńska - Lipnowska</option>
                        <option value="Wieluńska - Radomska">Wieluńska - Radomska</option>
                        <option value="Wieniecka">Wieniecka</option>
                        <option value="Wierzbowa">Wierzbowa</option>
                        <option value="Wieżycka">Wieżycka</option>
                        <option value="Wiklinowa">Wiklinowa</option>
                        <option value="Wilanowska">Wilanowska</option>
                        <option value="Wileńska">Wileńska</option>
                        <option value="Wiosny Ludów">Wiosny Ludów</option>
                        <option value="Witomino Centrum">Witomino Centrum</option>
                        <option value="Witomino Leśniczówka">Witomino Leśniczówka</option>
                        <option value="Witomino Polna">Witomino Polna</option>
                        <option value="Witomino Sosnowa">Witomino Sosnowa</option>
                        <option value="Witomińska">Witomińska</option>
                        <option value="Wiślinka Piaskowa">Wiślinka Piaskowa</option>
                        <option value="Wiśniewskiego">Wiśniewskiego</option>
                        <option value="Wodnika">Wodnika</option>
                        <option value="Wojska Polskiego">Wojska Polskiego</option>
                        <option value="Wolności - II LO">Wolności - II LO</option>
                        <option value="Worcella">Worcella</option>
                        <option value="Wołkowyska">Wołkowyska</option>
                        <option value="Wronki">Wronki</option>
                        <option value="Wrzeszcz PKP">Wrzeszcz PKP</option>
                        <option value="Wrzosowe Wzgórze">Wrzosowe Wzgórze</option>
                        <option value="Wróbla">Wróbla</option>
                        <option value="Wybickiego [GDY]">Wybickiego [GDY]</option>
                        <option value="Wybickiego [RU]">Wybickiego [RU]</option>
                        <option value="Wybickiego [SOP]">Wybickiego [SOP]</option>
                        <option value="Wyczółkowskiego">Wyczółkowskiego</option>
                        <option value="Wyspiańskiego">Wyspiańskiego</option>
                        <option value="Wyzwolenia">Wyzwolenia</option>
                        <option value="Wzgórze Św. Maksymiliana -  Kapliczka">Wzgórze Św. Maksymiliana -  Kapliczka</option>
                        <option value="Wzgórze Św. Maksymiliana SKM">Wzgórze Św. Maksymiliana SKM</option>
                        <option value="Wzgórze Św. Maksymiliana Syrokomli">Wzgórze Św. Maksymiliana
                            Syrokomli
                        </option>
                        <option value="Wąwóz Ostrowicki">Wąwóz Ostrowicki</option>
                        <option value="Węgorzowa">Węgorzowa</option>
                        <option value="Węzeł Elbląska">Węzeł Elbląska</option>
                        <option value="Węzeł Franciszki Cegielskiej">Węzeł Franciszki Cegielskiej</option>
                        <option value="Węzeł Groddecka">Węzeł Groddecka</option>
                        <option value="Węzeł Harfa">Węzeł Harfa</option>
                        <option value="Węzeł Karczemki">Węzeł Karczemki</option>
                        <option value="Węzeł Kliniczna">Węzeł Kliniczna</option>
                        <option value="Węzeł Lipce">Węzeł Lipce</option>
                        <option value="Węzeł Ofiar Grudnia '70">Węzeł Ofiar Grudnia '70</option>
                        <option value="Węzeł Żołnierzy Wyklętych">Węzeł Żołnierzy Wyklętych
                        </option>
                        <option value="Władysława IV [GDA]">Władysława IV [GDA]</option>
                        <option value="Władysława IV [SOP]">Władysława IV [SOP]</option>
                        <option value="Zabornia">Zabornia</option>
                        <option value="Zabytkowa">Zabytkowa</option>
                        <option value="Zacna">Zacna</option>
                        <option value="Zagony">Zagony</option>
                        <option value="Zagroble">Zagroble</option>
                        <option value="Zajezdnia">Zajezdnia</option>
                        <option value="Zajezdnia NOWY PORT">Zajezdnia NOWY PORT</option>
                        <option value="Zajezdnia WRZESZCZ">Zajezdnia WRZESZCZ</option>
                        <option value="Zakoniczyn">Zakoniczyn</option>
                        <option value="Zakopiańska">Zakopiańska</option>
                        <option value="Zakład Utylizacyjny">Zakład Utylizacyjny</option>
                        <option value="Zamenhofa [GDA]">Zamenhofa [GDA]</option>
                        <option value="Zamenhofa [GDY]">Zamenhofa [GDY]</option>
                        <option value="Zapolskiej">Zapolskiej</option>
                        <option value="Zaroślak">Zaroślak</option>
                        <option value="Zaruskiego">Zaruskiego</option>
                        <option value="Zaspa">Zaspa</option>
                        <option value="Zaspa - Szpital">Zaspa - Szpital</option>
                        <option value="Zaspa SKM">Zaspa SKM</option>
                        <option value="Zastawna">Zastawna</option>
                        <option value="Zawodzie">Zawodzie</option>
                        <option value="Zbieżna">Zbieżna</option>
                        <option value="Zbożowa">Zbożowa</option>
                        <option value="Zdrojowa">Zdrojowa</option>
                        <option value="Zespół Szkół Morskich">Zespół Szkół Morskich</option>
                        <option value="Zeusa">Zeusa</option>
                        <option value="Zielona - Działki I">Zielona - Działki I</option>
                        <option value="Zielona - Działki II">Zielona - Działki II</option>
                        <option value="Zielona - Kościół">Zielona - Kościół</option>
                        <option value="Zielony Stok">Zielony Stok</option>
                        <option value="Zimna">Zimna</option>
                        <option value="Zosi">Zosi</option>
                        <option value="Zwierzyniecka">Zwierzyniecka</option>
                        <option value="Zwinisławy">Zwinisławy</option>
                        <option value="Zwycięstwa - Wielkopolska">Zwycięstwa - Wielkopolska</option>
                        <option value="Złota">Złota</option>
                        <option value="Złota Karczma">Złota Karczma</option>
                        <option value="al. Płażyńskiego">al. Płażyńskiego</option>
                        <option value="Łabędzia">Łabędzia</option>
                        <option value="Łagowska">Łagowska</option>
                        <option value="Łanowa I">Łanowa I</option>
                        <option value="Łanowa II">Łanowa II</option>
                        <option value="Łanowa III">Łanowa III</option>
                        <option value="Łanowa IV">Łanowa IV</option>
                        <option value="Łapińska">Łapińska</option>
                        <option value="Łokietka">Łokietka</option>
                        <option value="Łostowice Świętokrzyska">Łostowice Świętokrzyska</option>
                        <option value="Łowicka - Szkoła">Łowicka - Szkoła</option>
                        <option value="Łowicka [GDA]">Łowicka [GDA]</option>
                        <option value="Łowicka [GDY]">Łowicka [GDY]</option>
                        <option value="Łużycka [GDY]">Łużycka [GDY]</option>
                        <option value="Łużycka [SOP]">Łużycka [SOP]</option>
                        <option value="Łódzka">Łódzka</option>
                        <option value="Łąkowa">Łąkowa</option>
                        <option value="Łęczycka">Łęczycka</option>
                        <option value="Łężyce">Łężyce</option>
                        <option value="Łężyce - Głodówko">Łężyce - Głodówko</option>
                        <option value="Łężyce - Jeżynowa">Łężyce - Jeżynowa</option>
                        <option value="Łężyce - Limbowa">Łężyce - Limbowa</option>
                        <option value="Topolowa"> Topolowa</option>
                        <option value="Ściegiennego">Ściegiennego</option>
                        <option value="Śluza">Śluza</option>
                        <option value="Śląska">Śląska</option>
                        <option value="Śmiechowo Ogrodowa">Śmiechowo Ogrodowa</option>
                        <option value="Śmiechowo SKM - Ceynowy">Śmiechowo SKM - Ceynowy</option>
                        <option value="Śnieżna">Śnieżna</option>
                        <option value="Śródmieście SKM">Śródmieście SKM</option>
                        <option value="Św. Brata Alberta">Św. Brata Alberta</option>
                        <option value="Św. Wojciech">Św. Wojciech</option>
                        <option value="Świbnieńska I">Świbnieńska I</option>
                        <option value="Świbnieńska II">Świbnieńska II</option>
                        <option value="Świbnieńska III">Świbnieńska III</option>
                        <option value="Świtezianki">Świtezianki</option>
                        <option value="Świętokrzyska">Świętokrzyska</option>
                        <option value="Świętopełka">Świętopełka</option>
                        <option value="Źródlana">Źródlana</option>
                        <option value="Źródło Marii">Źródło Marii</option>
                        <option value="Żabi Kruk">Żabi Kruk</option>
                        <option value="Żabianka SKM">Żabianka SKM</option>
                        <option value="Żaglowa - AmberExpo">Żaglowa - AmberExpo</option>
                        <option value="Żarnowiecka">Żarnowiecka</option>
                        <option value="Żelazna">Żelazna</option>
                        <option value="Żeliwna">Żeliwna</option>
                        <option value="Żeromskiego [RU]">Żeromskiego [RU]</option>
                        <option value="Żeromskiego [SOP]">Żeromskiego [SOP]</option>
                        <option value="Żołnierzy I Dywizji WP">Żołnierzy I Dywizji WP</option>
                        <option value="Żukowo - Baza PA Gryf">Żukowo - Baza PA "Gryf"</option>
                        <option value="Żukowo - Dworcowa">Żukowo - Dworcowa</option>
                        <option value="Żukowo - Fenikowskiego">Żukowo - Fenikowskiego</option>
                        <option value="Żukowo - Os. Norbertanek">Żukowo - Os. Norbertanek</option>
                        <option value="Żukowo - Słoneczna">Żukowo - Słoneczna</option>
                        <option value="Żukowo - Urząd Gminy">Żukowo - Urząd Gminy</option>
                        <option value="Żurawia">Żurawia</option>
                        <option value="Żwirki i Wigury [GDA]">Żwirki i Wigury [GDA]</option>
                        <option value="Żwirki i Wigury [GDY]">Żwirki i Wigury [GDY]</option>
                        <option value="Żwirki i Wigury [PG]">Żwirki i Wigury [PG]</option>
                        <option value="Żwirki i Wigury [RU]">Żwirki i Wigury [RU]</option>
                        <option value="Życzliwa">Życzliwa</option>
                    </select>
                    <button className="ml-5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                            type="submit">Szukaj odjazdów!
                    </button>
                </form>

                <div className="h-auto flex justify-center items-center mt-4">
                    <div className="" id="DeparturesContainer1">
                    </div>
                </div>

            </main>
        )

    }
}

export default Opoznienia;