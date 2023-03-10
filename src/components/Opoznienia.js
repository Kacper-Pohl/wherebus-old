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
            let stopName = x.stopDesc.replace(" (N/??)", "").trimEnd();
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
            document.getElementById("DeparturesContainer1").innerHTML += "<table class='border-collapse border border-gray-900 text-yellow-500 font-bold text-lg'><tr '><td class='w-9/12'>Numer linii: </td><td class='w-3/12'>" + linia + "</td></tr><tr><td>Numer pojazdu: </td><td>" + numer_busa + "</td></tr><tr><td>Do: </td><td>" + kierunek + "</td></tr><tr><td>Czas rozk??adowy: </td><td>" + czas_theo + "</td></tr><tr><td>Czas przewidywany: </td><td>" + czas_est + "</td></tr><tr><td>Rok produkcji: </td><td>" + rok_produkcji + "</td></tr><tr><td>USB: </td><td>" + czy_usb + "</td></tr><tr><td>Klimatyzacja: </td><td>" + czy_klima + "</td></tr><tr><td>AED: </td><td>" + czy_aed + "</td></tr></table><br>";
            return true;
        }
        else if(i == mydata["results"].length-1){
            document.getElementById("DeparturesContainer1").innerHTML += "<table class='border-collapse border border-gray-900 text-yellow-500 font-bold text-lg'><tr><td class='w-9/12'>Numer linii: </td><td class='w-3/12'>" + linia + "</td></tr><tr><td>Numer pojazdu: </td><td>" + numer_busa + "</td></tr><tr><td>Do: </td><td>" + kierunek + "</td></tr><tr><td>Czas rozk??adowy: </td><td>" + czas_theo + "</td></tr><tr><td>Czas przewidywany: </td><td>" + czas_est + "</td></tr><tr><td>Brak dodatkowych informacji o poje??dzie </td></tr></table><br>";
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
                                    //document.getElementById("DeparturesContainer1").innerHTML += "<table class='border-separate border border-gray-900 bg-black text-yellow-500 font-bold text-lg'><tr><td>Id busa: </td><td> " + id_busa + "</td></tr><tr><td>Trasa: </td><td>" + id_trasy + "</td></tr><tr><td>Do: </td><td>" + kierunek + "</td></tr><tr><td>Czas rozk??adowy: </td><td>" + czas_theo + "</td></tr><tr><td>Czas przewidywany: </td><td>" + czas_est + "</td></tr></table><br>";
                                } catch {
                                    console.log('zle');
                                }
                            }
                            if(Data[Data3[stopName][j]].delay.length == 0 && j == Data3[stopName].length-1 && document.getElementById("DeparturesContainer1").innerHTML == "" && czy_weszlo == 0){
                                document.getElementById("DeparturesContainer1").innerHTML += "<div class='text-yellow-50 font-extrabold text-lg'><a>Z wybranego przystanku nie ma obecnie ??adnych odjazd??w!</a></div>";
                            }
                        }
                    } catch {
                        document.getElementById("DeparturesContainer1").innerHTML += "<div class='text-yellow-50 font-extrabold text-lg'><a>Z wybranego przystanku nie ma obecnie ??adnych odjazd??w!</a></div>";
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
                        <option value="10 Lutego - Skwer Ko??ciuszki">10 Lutego - Skwer Ko??ciuszki</option>
                        <option value="23 Marca">23 Marca</option>
                        <option value="25-lecia Solidarno??ci">25-lecia Solidarno??ci</option>
                        <option value="3 Maja - Hala">3 Maja - Hala</option>
                        <option value="3 Maja">3 Maja [GDY]</option>
                        <option value="3 Maja ">3 Maja [SOP]</option>
                        <option value="49 Baza Lotnicza">49 Baza Lotnicza</option>
                        <option value="Abrahama">Abrahama</option>
                        <option value="Aeroklub Gda??ski">Aeroklub Gda??ski</option>
                        <option value="Agrarna">Agrarna</option>
                        <option value="Akademia Marynarki Wojennej" selected="selected">Akademia Marynarki Wojennej
                        </option>
                        <option value="Akademia Muzyczna">Akademia Muzyczna</option>
                        <option value="Aksamitna">Aksamitna</option>
                        <option value="Alzacka">Alzacka</option>
                        <option value="AmberExpo">AmberExpo</option>
                        <option value="Amona">Amona</option>
                        <option value="Andruszkiewicza">Andruszkiewicza</option>
                        <option value="Any??owa">Any??owa</option>
                        <option value="Archikatedra Oliwska">Archikatedra Oliwska</option>
                        <option value="Architekt??w">Architekt??w</option>
                        <option value="Arciszewskich">Arciszewskich</option>
                        <option value="Armii Krajowej">Armii Krajowej</option>
                        <option value="Astronaut??w">Astronaut??w</option>
                        <option value="Azaliowa">Azaliowa</option>
                        <option value="Babie Do??y">Babie Do??y</option>
                        <option value="Bajana">Bajana</option>
                        <option value="Bajki">Bajki</option>
                        <option value="Banino Szko??a">Banino Szko??a</option>
                        <option value="Barniewicka">Barniewicka</option>
                        <option value="Bartnicza">Bartnicza</option>
                        <option value="Batalion??w Ch??opskich">Batalion??w Ch??opskich</option>
                        <option value="Batorego - Szko??a">Batorego - Szko??a</option>
                        <option value="Baza Hallera">Baza Hallera</option>
                        <option value="Baza Manipulacyjna">Baza Manipulacyjna</option>
                        <option value="Baza na Pog??rzu Dolnym">Baza na Pog??rzu Dolnym</option>
                        <option value="Ba??niowa">Ba??niowa</option>
                        <option value="Ba??y??skiego [GDA]">Ba??y??skiego [GDA]</option>
                        <option value="Ba??y??skiego [GDY]">Ba??y??skiego [GDY]</option>
                        <option value="Belgradzka">Belgradzka</option>
                        <option value="Bema">Bema</option>
                        <option value="Beniowskiego">Beniowskiego</option>
                        <option value="Beniowskiego - Akademiki">Beniowskiego - Akademiki</option>
                        <option value="Benis??awskiego">Benis??awskiego</option>
                        <option value="Benzynowa">Benzynowa</option>
                        <option value="Bernadowska">Bernadowska</option>
                        <option value="Bia??a">Bia??a</option>
                        <option value="Bia??owieska">Bia??owieska</option>
                        <option value="Bia??y Dw??r">Bia??y Dw??r</option>
                        <option value="Biblioteka G????wna UG">Biblioteka G????wna UG</option>
                        <option value="Bieszczadzka">Bieszczadzka</option>
                        <option value="Bitwy pod P??owcami">Bitwy pod P??owcami</option>
                        <option value="Biwakowa">Biwakowa</option>
                        <option value="Bluszczowa">Bluszczowa</option>
                        <option value="Bobrowa">Bobrowa</option>
                        <option value="Bogatka I">Bogatka I</option>
                        <option value="Bogatka II">Bogatka II</option>
                        <option value="Bogatka III">Bogatka III</option>
                        <option value="Boguckiego">Boguckiego</option>
                        <option value="Bohater??w Monte Cassino [PG]">Bohater??w Monte Cassino [PG]</option>
                        <option value="Bohater??w Monte Cassino [SOP]">Bohater??w Monte Cassino [SOP]</option>
                        <option value="Bojano">Bojano</option>
                        <option value="Bojano - Ko??ci????">Bojano - Ko??ci????</option>
                        <option value="Bojano - Milenium">Bojano - Milenium</option>
                        <option value="Bojano - Rolnicza">Bojano - Rolnicza</option>
                        <option value="Bora-Komorowskiego">Bora-Komorowskiego</option>
                        <option value="Borowiecka">Borowiecka</option>
                        <option value="Borska">Borska</option>
                        <option value="Bosma??ska - Nasypowa">Bosma??ska - Nasypowa</option>
                        <option value="Bosma??ska - Zielona">Bosma??ska - Zielona</option>
                        <option value="Botaniczna">Botaniczna</option>
                        <option value="Bpa Okoniewskiego">Bpa Okoniewskiego</option>
                        <option value="Brama Nizinna">Brama Nizinna</option>
                        <option value="Brama Oliwska">Brama Oliwska</option>
                        <option value="Brama Oru??ska">Brama Oru??ska</option>
                        <option value="Brama Wy??ynna">Brama Wy??ynna</option>
                        <option value="Brama ??u??awska">Brama ??u??awska</option>
                        <option value="Bratki">Bratki</option>
                        <option value="Brodnicka">Brodnicka</option>
                        <option value="Brodwino">Brodwino</option>
                        <option value="Brodwino - Szko??a">Brodwino - Szko??a</option>
                        <option value="Bryla">Bryla</option>
                        <option value="Brzechwy">Brzechwy</option>
                        <option value="Brzegowa">Brzegowa</option>
                        <option value="Brze??no">Brze??no</option>
                        <option value="Br??towo PKM">Br??towo PKM</option>
                        <option value="Budapeszta??ska">Budapeszta??ska</option>
                        <option value="Budzysza">Budzysza</option>
                        <option value="Bulwar Nadmorski">Bulwar Nadmorski</option>
                        <option value="Bursztynowa">Bursztynowa</option>
                        <option value="Bysewo">Bysewo</option>
                        <option value="B??awatna">B??awatna</option>
                        <option value="B??onia">B??onia</option>
                        <option value="CH Port Rumia - Grunwaldzka">CH "Port Rumia" - Grunwaldzka</option>
                        <option value="CH Port Rumia - Kosynier??w">CH "Port Rumia" - Kosynier??w</option>
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
                        <option value="Cha??ubi??skiego">Cha??ubi??skiego</option>
                        <option value="Che??m - Wi??ckowskiego">Che??m - Wi??ckowskiego</option>
                        <option value="Che??m Cienista">Che??m Cienista</option>
                        <option value="Che??m Witosa">Che??m Witosa</option>
                        <option value="Che??mo??skiego">Che??mo??skiego</option>
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
                        <option value="Chwarzno Sok????ka">Chwarzno Sok????ka</option>
                        <option value="Chwaszczyno">Chwaszczyno</option>
                        <option value="Chwaszczyno - Boczna">Chwaszczyno - Boczna</option>
                        <option value="Chwaszczyno - Gdy??ska">Chwaszczyno - Gdy??ska</option>
                        <option value="Chwaszczyno - Lisia">Chwaszczyno - Lisia</option>
                        <option value="Chwaszczyno - Oliwska">Chwaszczyno - Oliwska</option>
                        <option value="Chwaszczyno - Poczta">Chwaszczyno - Poczta</option>
                        <option value="Chwaszczyno - Szmaragdowa">Chwaszczyno - Szmaragdowa</option>
                        <option value="Chwaszczyno - Wiejska">Chwaszczyno - Wiejska</option>
                        <option value="Chylonia Centrum">Chylonia Centrum</option>
                        <option value="Chylonia Dworzec PKP">Chylonia Dworzec PKP</option>
                        <option value="Chylonia Krzywoustego">Chylonia Krzywoustego</option>
                        <option value="Chylonia Dworzec PKP">Chylo??ska - Kcy??ska</option>
                        <option value="Ch??odna">Ch??odna</option>
                        <option value="Ch??opska">Ch??opska</option>
                        <option value="Ciasna">Ciasna</option>
                        <option value="Cicha (Cmentarz)">Cicha (Cmentarz)</option>
                        <option value="Cieszy??skiego">Cieszy??skiego</option>
                        <option value="Cio??kowskiego">Cio??kowskiego</option>
                        <option value="Cisowa Granica Miasta">Cisowa Granica Miasta</option>
                        <option value="Cisowa SKM">Cisowa SKM</option>
                        <option value="Cisowa Sibeliusa">Cisowa Sibeliusa</option>
                        <option value="Cmentarna">Cmentarna</option>
                        <option value="Cmentarz">Cmentarz</option>
                        <option value="Cmentarz Komunalny">Cmentarz Komunalny</option>
                        <option value="Cmentarz Oliwski">Cmentarz Oliwski</option>
                        <option value="Cmentarz Srebrzysko">Cmentarz Srebrzysko</option>
                        <option value="Cmentarz Witomi??ski">Cmentarz Witomi??ski</option>
                        <option value="Cmentarz ??ostowicki">Cmentarz ??ostowicki</option>
                        <option value="Cyga??ska G??ra">Cyga??ska G??ra</option>
                        <option value="Cylkowskiego">Cylkowskiego</option>
                        <option value="Cyprysowa">Cyprysowa</option>
                        <option value="Cysters??w">Cysters??w</option>
                        <option value="Czarny Dw??r">Czarny Dw??r</option>
                        <option value="Czermi??skiego">Czermi??skiego</option>
                        <option value="Czernickiego I">Czernickiego I</option>
                        <option value="Czernickiego II">Czernickiego II</option>
                        <option value="Czerwony Dw??r">Czerwony Dw??r</option>
                        <option value="Czwartak??w">Czwartak??w</option>
                        <option value="Czwartak??w">Czy??ewskiego</option>
                        <option value="Damroki">Damroki</option>
                        <option value="Dembi??skiego">Dembi??skiego</option>
                        <option value="Demptowo">Demptowo</option>
                        <option value="Demptowo - Jednostka Wojskowa">Demptowo - Jednostka Wojskowa</option>
                        <option value="Demptowska">Demptowska</option>
                        <option value="Derdowskiego">Derdowskiego</option>
                        <option value="Derdowskiego - D??bog??rska">Derdowskiego - D??bog??rska</option>
                        <option value="Derdowskiego - Przychodnia">Derdowskiego - Przychodnia</option>
                        <option value="Dickensa">Dickensa</option>
                        <option value="Do Zdroju">Do Zdroju</option>
                        <option value="Dobra">Dobra</option>
                        <option value="Dobrowo">Dobrowo</option>
                        <option value="Dobrowolskiego">Dobrowolskiego</option>
                        <option value="Dobrzewino - Boja??ska">Dobrzewino - Boja??ska</option>
                        <option value="Dobrzewino - Dworska">Dobrzewino - Dworska</option>
                        <option value="Dobrzewino - Grabowa">Dobrzewino - Grabowa</option>
                        <option value="Dobrzewino - Kasztela??ska">Dobrzewino - Kasztela??ska</option>
                        <option value="Dobrzewino - Owsiana">Dobrzewino - Owsiana</option>
                        <option value="Doker??w">Doker??w</option>
                        <option value="Dolna">Dolna</option>
                        <option value="Dolne M??yny">Dolne M??yny</option>
                        <option value="Dolny Sopot - Haffnera">Dolny Sopot - Haffnera</option>
                        <option value="Dom Marynarza">Dom Marynarza</option>
                        <option value="Dom Pomocy Spo??ecznej">Dom Pomocy Spo??ecznej</option>
                        <option value="Domeyki">Domeyki</option>
                        <option value="Dragana - K??adka">Dragana - K??adka</option>
                        <option value="Dragana - Szko??a">Dragana - Szko??a</option>
                        <option value="Drw??cka (n/??)">Drw??cka (n/??)</option>
                        <option value="Drzewieckiego">Drzewieckiego</option>
                        <option value="Drzyma??y">Drzyma??y</option>
                        <option value="Dulkowa">Dulkowa</option>
                        <option value="Dworkowa">Dworkowa</option>
                        <option value="Dworska">Dworska</option>
                        <option value="Dworzec G????wny">Dworzec G????wny</option>
                        <option value="Dworzec Morski - Muzeum Emigracji">Dworzec Morski - Muzeum Emigracji</option>
                        <option value="Dworzec PKS">Dworzec PKS</option>
                        <option value="Dw??r Ferber??w">Dw??r Ferber??w</option>
                        <option value="Dywizjonu 303">Dywizjonu 303</option>
                        <option value="Dzia??ki Le??ne - Sztumska">Dzia??ki Le??ne - Sztumska</option>
                        <option value="Dziewicza">Dziewicza</option>
                        <option value="D??bka - Zesp???? Szk????">D??bka - Zesp???? Szk????</option>
                        <option value="D??bka - Zielona">D??bka - Zielona</option>
                        <option value="D??browa Centrum">D??browa Centrum</option>
                        <option value="D??browa Mi??towa">D??browa Mi??towa</option>
                        <option value="D??browskiego">D??browskiego</option>
                        <option value="D??browskiego - Ko??ci????">D??browskiego - Ko??ci????</option>
                        <option value="D??browskiego - Most">D??browskiego - Most</option>
                        <option value="D??binki">D??binki</option>
                        <option value="D??bog??rze - Jednostka Wojskowa">D??bog??rze - Jednostka Wojskowa</option>
                        <option value="D??bog??rze - Naftobazy">D??bog??rze - Naftobazy</option>
                        <option value="D??bog??rze - Okopowa">D??bog??rze - Okopowa</option>
                        <option value="D??bog??rze - Owocowa">D??bog??rze - Owocowa</option>
                        <option value="D??bog??rze - Partyzant??w">D??bog??rze - Partyzant??w</option>
                        <option value="D??bog??rze - Szko??a">D??bog??rze - Szko??a</option>
                        <option value="D??bog??rze - S??onecznikowa">D??bog??rze - S??onecznikowa</option>
                        <option value="D??bog??rze-Wybudowanie - Boisko">D??bog??rze-Wybudowanie - Boisko</option>
                        <option value="D??bog??rze-Wybudowanie - D??uga">D??bog??rze-Wybudowanie - D??uga
                        </option>
                        <option value="D??bog??rze-Wybudowanie - Le??na">D??bog??rze-Wybudowanie - Le??na
                        </option>
                        <option value="D??bog??rze-Wybudowanie - Mostowa">D??bog??rze-Wybudowanie - Mostowa
                        </option>
                        <option value="D??uga">D??uga</option>
                        <option value="D??ugie Ogrody">D??ugie Ogrody</option>
                        <option value="Ejsmonda">Ejsmonda</option>
                        <option value="Elbl??ska">Elbl??ska</option>
                        <option value="Elektrociep??ownia - Kontenerowa">Elektrociep??ownia - Kontenerowa</option>
                        <option value="Elektrociep??ownia - Pucka">Elektrociep??ownia - Pucka</option>
                        <option value="Elektrowozownia SKM">Elektrowozownia SKM</option>
                        <option value="Elf??w">Elf??w</option>
                        <option value="Emaus">Emaus</option>
                        <option value="Emilii Plater">Emilii Plater</option>
                        <option value="Energetyk??w">Energetyk??w</option>
                        <option value="Ergo Arena">Ergo Arena</option>
                        <option value="Europejskie Centrum Solidarno??ci">Europejskie Centrum Solidarno??ci</option>
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
                        <option value="Galeria Ba??tycka">Galeria Ba??tycka</option>
                        <option value="Galeria Szperk">Galeria Szperk</option>
                        <option value="Gda??ska">Gda??ska</option>
                        <option value="Gda??ska - Zryw">Gda??ska - "Zryw"</option>
                        <option value="Gda??ska - Cmentarz">Gda??ska - Cmentarz</option>
                        <option value="Gda??ska - Ko??ci????">Gda??ska - Ko??ci????</option>
                        <option value="Gda??ska - Szkolna">Gda??ska - Szkolna</option>
                        <option value="Gdynia Arena">Gdynia Arena</option>
                        <option value="Gdynia Dworzec G??. PKP">Gdynia Dworzec G??. PKP</option>
                        <option value="Gdynia Dworzec G??. PKP - Dworcowa">Gdynia Dworzec G??. PKP - Dworcowa
                        </option>
                        <option value="Gdynia Dworzec G??. PKP - Hala">Gdynia Dworzec G??. PKP - Hala</option>
                        <option value="Gdynia Dworzec G??. PKP - Morska">Gdynia Dworzec G??. PKP - Morska</option>
                        <option value="Gdynia Dworzec G??. PKP - Wolno??ci">Gdynia Dworzec G??. PKP - Wolno??ci
                        </option>
                        <option value="Gdynia Karwiny PKM">Gdynia Karwiny PKM</option>
                        <option value="Gdynia Na??kowskiej">Gdynia Na??kowskiej</option>
                        <option value="Gdynia ??r??d??o Marii">Gdynia ??r??d??o Marii</option>
                        <option value="Geodet??w">Geodet??w</option>
                        <option value="Gospody">Gospody</option>
                        <option value="Gosty??ska Szpital">Gosty??ska Szpital</option>
                        <option value="Goyki">Goyki</option>
                        <option value="Go????bia">Go????bia</option>
                        <option value="Go??cinna">Go??cinna</option>
                        <option value="Grabowo">Grabowo</option>
                        <option value="Grabowskiego">Grabowskiego</option>
                        <option value="Grab??wek SKM">Grab??wek SKM</option>
                        <option value="Gradowa">Gradowa</option>
                        <option value="Grand Hotel">Grand Hotel</option>
                        <option value="Grenadier??w">Grenadier??w</option>
                        <option value="Gronostajowa">Gronostajowa</option>
                        <option value="Grudzi??dzka">Grudzi??dzka</option>
                        <option value="Grunwaldzka">Grunwaldzka</option>
                        <option value="Grunwaldzka - Ceynowy">Grunwaldzka - Ceynowy</option>
                        <option value="Gruszkowa">Gruszkowa</option>
                        <option value="Gryfa Pomorskiego">Gryfa Pomorskiego</option>
                        <option value="Grzybowa">Grzybowa</option>
                        <option value="G??ralska">G??ralska</option>
                        <option value="G??recka">G??recka</option>
                        <option value="G??rki Wschodnie">G??rki Wschodnie</option>
                        <option value="G??rki Zachodnie">G??rki Zachodnie</option>
                        <option value="G??rnicza">G??rnicza</option>
                        <option value="G??rnicza - Damroki">G??rnicza - Damroki</option>
                        <option value="G??rnicza - Ko??ci????">G??rnicza - Ko??ci????</option>
                        <option value="G??rskiego">G??rskiego</option>
                        <option value="G??sia">G??sia</option>
                        <option value="G??ucha">G??ucha</option>
                        <option value="G????boka">G????boka</option>
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
                        <option value="Hutnicza - Dzia??ki">Hutnicza - Dzia??ki</option>
                        <option value="Hutnicza - Estakada">Hutnicza - Estakada</option>
                        <option value="Hutnicza - Piaskowa">Hutnicza - Piaskowa</option>
                        <option value="Hutnicza - Stacja Paliw Lotos">Hutnicza - Stacja Paliw Lotos</option>
                        <option value="Hynka">Hynka</option>
                        <option value="I Urz??d Skarbowy">I Urz??d Skarbowy</option>
                        <option value="II Urz??d Skarbowy">II Urz??d Skarbowy</option>
                        <option value="Ikara">Ikara</option>
                        <option value="Instal">Instal</option>
                        <option value="Instytut Med. Morskiej i Tropikalnej">Instytut Med. Morskiej i Tropikalnej
                        </option>
                        <option value="In??ynierska">In??ynierska</option>
                        <option value="I??awska">I??awska</option>
                        <option value="Jab??oniowa Osiedle">Jab??oniowa Osiedle</option>
                        <option value="Jagiello??ska">Jagiello??ska</option>
                        <option value="Jagie????y">Jagie????y</option>
                        <option value="Jana Paw??a II">Jana Paw??a II</option>
                        <option value="Jana z Kolna [GDA]">Jana z Kolna [GDA]</option>
                        <option value="Jana z Kolna [SOP]">Jana z Kolna [SOP]</option>
                        <option value="Janka Wi??niewskiego">Janka Wi??niewskiego</option>
                        <option value="Jankowo">Jankowo</option>
                        <option value="Janowo SKM">Janowo SKM</option>
                        <option value="Janowo SKM - Sobieskiego">Janowo SKM - Sobieskiego</option>
                        <option value="Jarowa">Jarowa</option>
                        <option value="Jasia i Ma??gosi">Jasia i Ma??gosi</option>
                        <option value="Jasie?? Dzia??ki">Jasie?? Dzia??ki</option>
                        <option value="Jasie?? PKM">Jasie?? PKM</option>
                        <option value="Jasie?? P??lnicy">Jasie?? P??lnicy</option>
                        <option value="Jasie??ska">Jasie??ska</option>
                        <option value="Jask????cza">Jask????cza</option>
                        <option value="Jaworowa">Jaworowa</option>
                        <option value="Jaworzniak??w">Jaworzniak??w</option>
                        <option value="Ja??owcowa">Ja??owcowa</option>
                        <option value="Ja??kowa Dolina">Ja??kowa Dolina</option>
                        <option value="Jednoro??ca">Jednoro??ca</option>
                        <option value="Jeleniog??rska">Jeleniog??rska</option>
                        <option value="Jelitkowo">Jelitkowo</option>
                        <option value="Jelitkowo Kapliczna">Jelitkowo Kapliczna</option>
                        <option value="Jesionowa">Jesionowa</option>
                        <option value="Jeziorna">Jeziorna</option>
                        <option value="Jeziorowa">Jeziorowa</option>
                        <option value="Jodowa">Jodowa</option>
                        <option value="Junak??w">Junak??w</option>
                        <option value="J??czmienna">J??czmienna</option>
                        <option value="Kacze Buki">Kacze Buki</option>
                        <option value="Kacze Buki Puszczyka">Kacze Buki Puszczyka</option>
                        <option value="Kacze??ce">Kacze??ce</option>
                        <option value="Kacze??ce - Sienna">Kacze??ce - Sienna</option>
                        <option value="Kadmowa">Kadmowa</option>
                        <option value="Kalksztajn??w">Kalksztajn??w</option>
                        <option value="Kalksztajn??w - Bloki">Kalksztajn??w - Bloki</option>
                        <option value="Kameliowa">Kameliowa</option>
                        <option value="Kamienna Grobla">Kamienna Grobla</option>
                        <option value="Kamienny Potok - Ko??ci????">Kamienny Potok - Ko??ci????</option>
                        <option value="Kamienny Potok - Kujawska">Kamienny Potok - Kujawska</option>
                        <option value="Kamienny Potok SKM">Kamienny Potok SKM</option>
                        <option value="Kamie??">Kamie??</option>
                        <option value="Kamie?? - Asnyka">Kamie?? - Asnyka</option>
                        <option value="Kampinoska">Kampinoska</option>
                        <option value="Kamrowskiego">Kamrowskiego</option>
                        <option value="Kana?? Leniwy">Kana?? Leniwy</option>
                        <option value="Kana??owa">Kana??owa</option>
                        <option value="Kapita??ska">Kapita??ska</option>
                        <option value="Karczemki - Tuchomska">Karczemki - Tuchomska</option>
                        <option value="Karczemki Szko??a">Karczemki Szko??a</option>
                        <option value="Karczemki [GDA]">Karczemki [GDA]</option>
                        <option value="Karczemki [SZ]">Karczemki [SZ]</option>
                        <option value="Karskiego">Karskiego</option>
                        <option value="Kartuska">Kartuska</option>
                        <option value="Karwie??ska">Karwie??ska</option>
                        <option value="Karwiny Nowowiczli??ska">Karwiny Nowowiczli??ska</option>
                        <option value="Karwiny PKM">Karwiny PKM</option>
                        <option value="Karwiny Tuwima">Karwiny Tuwima</option>
                        <option value="Kasprowicza (rondo)">Kasprowicza (rondo)</option>
                        <option value="Kasztanowa">Kasztanowa</option>
                        <option value="Kasztela??ska">Kasztela??ska</option>
                        <option value="Kazimierz - Kazimierska">Kazimierz - Kazimierska</option>
                        <option value="Kazimierz - Listopadowa">Kazimierz - Listopadowa</option>
                        <option value="Kazimierz - Majowa">Kazimierz - Majowa</option>
                        <option value="Kazimierz - P??tla">Kazimierz - P??tla</option>
                        <option value="Kazimierz - Rumska">Kazimierz - Rumska</option>
                        <option value="Kempingowa">Kempingowa</option>
                        <option value="Keplera">Keplera</option>
                        <option value="Kielecka">Kielecka</option>
                        <option value="Kiele??ska Huta">Kiele??ska Huta</option>
                        <option value="Kielno - Bo??a??ska">Kielno - Bo??a??ska</option>
                        <option value="Kielno - Cmentarz">Kielno - Cmentarz</option>
                        <option value="Kielno - Ko??ci????">Kielno - Ko??ci????</option>
                        <option value="Kielno - Rondo">Kielno - Rondo</option>
                        <option value="Kielno - R????ana">Kielno - R????ana</option>
                        <option value="Kielno - Sikorskiego">Kielno - Sikorskiego</option>
                        <option value="Kielno - S??oneczna">Kielno - S??oneczna</option>
                        <option value="Kielno - Tredera">Kielno - Tredera</option>
                        <option value="Kie??pinek">Kie??pinek</option>
                        <option value="Kie??pinek PKM">Kie??pinek PKM</option>
                        <option value="Kie??pino - Szko??a">Kie??pino - Szko??a</option>
                        <option value="Kie??pino G??rne">Kie??pino G??rne</option>
                        <option value="Kili??skiego [GDA]">Kili??skiego [GDA]</option>
                        <option value="Kili??skiego [GDY]">Kili??skiego [GDY]</option>
                        <option value="Kliniczna">Kliniczna</option>
                        <option value="Klonowa [GDA]">Klonowa [GDA]</option>
                        <option value="Klonowa [RU]">Klonowa [RU]</option>
                        <option value="Klonowicza">Klonowicza</option>
                        <option value="Kmicica">Kmicica</option>
                        <option value="Knyszy??ska">Knyszy??ska</option>
                        <option value="Kochanowskiego">Kochanowskiego</option>
                        <option value="Kokoszki">Kokoszki</option>
                        <option value="Kokoszki - Poczta">Kokoszki - Poczta</option>
                        <option value="Kolberga">Kolberga</option>
                        <option value="Kolbudzka">Kolbudzka</option>
                        <option value="Koleczkowo - Gryfa Pomorskiego">Koleczkowo - Gryfa Pomorskiego</option>
                        <option value="Koleczkowo - Kamie??ska">Koleczkowo - Kamie??ska</option>
                        <option value="Koleczkowo - M??y??ska">Koleczkowo - M??y??ska</option>
                        <option value="Koleczkowo - Poczta">Koleczkowo - Poczta</option>
                        <option value="Koleczkowo - ????kowa">Koleczkowo - ????kowa</option>
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
                        <option value="Kopernika - Ko??ci????">Kopernika - Ko??ci????</option>
                        <option value="Kopernika - Partyzant??w">Kopernika - Partyzant??w</option>
                        <option value="Korczaka [GDA]">Korczaka [GDA]</option>
                        <option value="Korczaka [GDY]">Korczaka [GDY]</option>
                        <option value="Kordeckiego">Kordeckiego</option>
                        <option value="Korty Tenisowe">Korty Tenisowe</option>
                        <option value="Korzeniowskiego">Korzeniowskiego</option>
                        <option value="Kosakowo - Centrum Handlowe">Kosakowo - Centrum Handlowe</option>
                        <option value="Kosakowo - Centrum Sportowe">Kosakowo - Centrum Sportowe</option>
                        <option value="Kosakowo - Cmentarz - Brama
   G????wna">Kosakowo - Cmentarz - Brama
                            G????wna
                        </option>
                        <option value="Kosakowo - Cmentarz Komunalny">Kosakowo - Cmentarz Komunalny</option>
                        <option value="Kosakowo - Ko??ci????">Kosakowo - Ko??ci????</option>
                        <option value="Kosakowo - Krokusowa">Kosakowo - Krokusowa</option>
                        <option value="Kosakowo - Rumska">Kosakowo - Rumska</option>
                        <option value="Kosakowo - Staw">Kosakowo - Staw</option>
                        <option value="Kosakowo - Tulipanowa">Kosakowo - Tulipanowa</option>
                        <option value="Kosakowo - Urz??d Gminy">Kosakowo - Urz??d Gminy</option>
                        <option value="Kosakowo - Z??ote Piaski">Kosakowo - Z??ote Piaski</option>
                        <option value="Kosmonaut??w">Kosmonaut??w</option>
                        <option value="Kozioro??ca">Kozioro??ca</option>
                        <option value="Ko??obrzeska">Ko??obrzeska</option>
                        <option value="Ko??????taja">Ko??????taja</option>
                        <option value="Ko??ciuszki">Ko??ciuszki</option>
                        <option value="Ko??ciuszki - Kosynier??w">Ko??ciuszki - Kosynier??w</option>
                        <option value="Krasickiego">Krasickiego</option>
                        <option value="Kraszewskiego">Kraszewskiego</option>
                        <option value="Krofeya">Krofeya</option>
                        <option value="Krynicka">Krynicka</option>
                        <option value="Krzemowa [GDA]">Krzemowa [GDA]</option>
                        <option value="Krzemowa [GDY]">Krzemowa [GDY]</option>
                        <option value="Kr??lewskie Wzg??rze">Kr??lewskie Wzg??rze</option>
                        <option value="Kr??ta">Kr??ta</option>
                        <option value="Ku Uj??ciu">Ku Uj??ciu</option>
                        <option value="Kujawska [GDA]">Kujawska [GDA]</option>
                        <option value="Kujawska [RU]">Kujawska [RU]</option>
                        <option value="Kukawka">Kukawka</option>
                        <option value="Kurpiowska">Kurpiowska</option>
                        <option value="Kurpi??skiego">Kurpi??skiego</option>
                        <option value="Kusoci??skiego">Kusoci??skiego</option>
                        <option value="Ku??nierska">Ku??nierska</option>
                        <option value="Kwiatkowskiego">Kwiatkowskiego</option>
                        <option value="Kwiatkowskiej">Kwiatkowskiej</option>
                        <option value="Kwiatowa">Kwiatowa</option>
                        <option value="Kwidzy??ska I">Kwidzy??ska I</option>
                        <option value="Kwidzy??ska II">Kwidzy??ska II</option>
                        <option value="K??pna">K??pna</option>
                        <option value="K??osowa">K??osowa</option>
                        <option value="Latarnia Morska">Latarnia Morska</option>
                        <option value="Legion??w">Lawendowe Wzg??rze</option>
                        <option value="Lazurowa">Lazurowa</option>
                        <option value="Legion??w">Legion??w</option>
                        <option value="Lenartowicza">Lenartowicza</option>
                        <option value="Leszczynki I">Leszczynki I</option>
                        <option value="Leszczynki II">Leszczynki II</option>
                        <option value="Leszczynki SKM">Leszczynki SKM</option>
                        <option value="Leszczynowa">Leszczynowa</option>
                        <option value="Leszczy??skich">Leszczy??skich</option>
                        <option value="Le??na G??ra">Le??na G??ra</option>
                        <option value="Le??na G??ra - Przychodnia">Le??na G??ra - Przychodnia</option>
                        <option value="Le??na Polana">Le??na Polana</option>
                        <option value="Le??nicz??wka Rogulewo">Le??nicz??wka Rogulewo</option>
                        <option value="Le??nie??ska">Le??nie??ska</option>
                        <option value="Liceum Jezuit??w">Liceum Jezuit??w</option>
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
                        <option value="Ma??kowy">Ma??kowy</option>
                        <option value="Ma??kowo">Ma??kowo</option>
                        <option value="Ma??omiejska">Ma??omiejska</option>
                        <option value="Ma??opolska">Ma??opolska</option>
                        <option value="Ma??y Kack Sandomierska">Ma??y Kack Sandomierska</option>
                        <option value="Ma??y Kack Strzelc??w">Ma??y Kack Strzelc??w</option>
                        <option value="Ma??y Kack ????czycka">Ma??y Kack ????czycka</option>
                        <option value="Mechelinki - Przysta??">Mechelinki - Przysta??</option>
                        <option value="Meczet">Meczet</option>
                        <option value="Meissnera">Meissnera</option>
                        <option value="Meteorytowa">Meteorytowa</option>
                        <option value="Mia??ki Szlak">Mia??ki Szlak</option>
                        <option value="Micha??ki">Micha??ki</option>
                        <option value="Mickiewicza [GDA]">Mickiewicza [GDA]</option>
                        <option value="Mickiewicza [GDY]">Mickiewicza [GDY]</option>
                        <option value="Miedza">Miedza</option>
                        <option value="Mieros??awskiego">Mieros??awskiego</option>
                        <option value="Migowo">Migowo</option>
                        <option value="Mireckiego">Mireckiego</option>
                        <option value="Mireckiego (linia 102)">Mireckiego (linia 102)</option>
                        <option value="Miszewko">Miszewko</option>
                        <option value="Miszewko - Nowy Tuchom">Miszewko - Nowy Tuchom</option>
                        <option value="Miszewo">Miszewo</option>
                        <option value="Miszewo - P??powo">Miszewo - P??powo</option>
                        <option value="Miszewskiego">Miszewskiego</option>
                        <option value="Mjr Hubala">Mjr Hubala</option>
                        <option value="Mjr S??abego">Mjr S??abego</option>
                        <option value="Modra I">Modra I</option>
                        <option value="Modra II">Modra II</option>
                        <option value="Modra III">Modra III</option>
                        <option value="Modra IV">Modra IV</option>
                        <option value="Moniuszki">Moniuszki</option>
                        <option value="Monta??yst??w">Monta??yst??w</option>
                        <option value="Morska - Estakada">Morska - Estakada</option>
                        <option value="Morska - Kcy??ska">Morska - Kcy??ska</option>
                        <option value="Mostek">Mostek</option>
                        <option value="Mostostal">Mostostal</option>
                        <option value="Mostowa">Mostowa</option>
                        <option value="Mosty - Brzozowa">Mosty - Brzozowa</option>
                        <option value="Mosty - Ogrodowa">Mosty - Ogrodowa</option>
                        <option value="Mosty - Olchowa">Mosty - Olchowa</option>
                        <option value="Mosty - Szko??a">Mosty - Szko??a</option>
                        <option value="Mosty - Wierzbowa">Mosty - Wierzbowa</option>
                        <option value="Mosty - Wi??zowa">Mosty - Wi??zowa</option>
                        <option value="Muchowskiego">Muchowskiego</option>
                        <option value="Muzeum II Wojny ??wiatowej">Muzeum II Wojny ??wiatowej</option>
                        <option value="Muzeum Narodowe">Muzeum Narodowe</option>
                        <option value="My??liborska">My??liborska</option>
                        <option value="My??liwska [GDA]">My??liwska [GDA]</option>
                        <option value="My??liwska [GDY]">My??liwska [GDY]</option>
                        <option value="M??y??ska">M??y??ska</option>
                        <option value="Na Sza??cach">Na Sza??cach</option>
                        <option value="Na Wzg??rzu">Na Wzg??rzu</option>
                        <option value="Na Zasp??">Na Zasp??</option>
                        <option value="Nabrze??e Przemys??owe">Nabrze??e Przemys??owe</option>
                        <option value="Nad Jarem">Nad Jarem</option>
                        <option value="Nad Stawem">Nad Stawem</option>
                        <option value="Nadwi??la??ska">Nadwi??la??ska</option>
                        <option value="Nadwodna">Nadwodna</option>
                        <option value="Naftowa">Naftowa</option>
                        <option value="Nanice SKM - Kochanowskiego">Nanice SKM - Kochanowskiego</option>
                        <option value="Nanice SKM - Kociewska">Nanice SKM - Kociewska</option>
                        <option value="Napierskiego">Napierskiego</option>
                        <option value="Nasypowa">Nasypowa</option>
                        <option value="Nawigator??w">Nawigator??w</option>
                        <option value="Na??kowskiej">Na??kowskiej</option>
                        <option value="Necla">Necla</option>
                        <option value="Niedzia??kowskiego">Niedzia??kowskiego</option>
                        <option value="Nied??wiednik">Nied??wiednik</option>
                        <option value="Niegowska">Niegowska</option>
                        <option value="Niemcewicza">Niemcewicza</option>
                        <option value="Niepo??omicka">Niepo??omicka</option>
                        <option value="Niest??powo Szko??a">Niest??powo Szko??a</option>
                        <option value="Norblina">Norblina</option>
                        <option value="Norwida">Norwida</option>
                        <option value="Nowa">Nowa</option>
                        <option value="Nowa Gda??ska">Nowa Gda??ska</option>
                        <option value="Nowator??w">Nowator??w</option>
                        <option value="Nowe Ogrody">Nowe Ogrody</option>
                        <option value="Nowiny">Nowiny</option>
                        <option value="Nowogrodzka">Nowogrodzka</option>
                        <option value="Nowolipie">Nowolipie</option>
                        <option value="Nowowiejskiego">Nowowiejskiego</option>
                        <option value="Nowy Port Oliwska">Nowy Port Oliwska</option>
                        <option value="Nowy Port Szaniec Zachodni">Nowy Port Szaniec Zachodni</option>
                        <option value="Nowy Port Zajezdnia">Nowy Port Zajezdnia</option>
                        <option value="Nowy ??wiat">Nowy ??wiat</option>
                        <option value="Obro??c??w Helu">Obro??c??w Helu</option>
                        <option value="Obro??c??w Westerplatte">Obro??c??w Westerplatte</option>
                        <option value="Obro??c??w Wybrze??a">Obro??c??w Wybrze??a</option>
                        <option value="Obwodowa">Obwodowa</option>
                        <option value="Ob??u??e Centrum">Ob??u??e Centrum</option>
                        <option value="Ob??u??e Maciejewicza">Ob??u??e Maciejewicza</option>
                        <option value="Oczyszczalnia">Oczyszczalnia</option>
                        <option value="Odrza??ska">Odrza??ska</option>
                        <option value="Odyseusza">Odyseusza</option>
                        <option value="Ogrodowa">Ogrodowa</option>
                        <option value="Ogrody Dzia??kowe R??biechowo">Ogrody Dzia??kowe "R??biechowo" I
                        </option>
                        <option value="Ogrody Dzia??kowe R??biechowo II">Ogrody Dzia??kowe "R??biechowo"II</option>
                        <option value="Ogrody Dzia??kowe R??biechowo III">Ogrody Dzia??kowe "R??biechowo" III</option>
                        <option value="Ogr??d Botaniczny Marszewo">Ogr??d Botaniczny Marszewo</option>
                        <option value="Okopowa">Okopowa</option>
                        <option value="Okrzei">Okrzei</option>
                        <option value="Okr????na">Okr????na</option>
                        <option value="Okr????na I">Okr????na I</option>
                        <option value="Okr????na II">Okr????na II</option>
                        <option value="Oksywie Dickmana">Oksywie Dickmana</option>
                        <option value="Oksywie Dolne">Oksywie Dolne</option>
                        <option value="Oksywie Godebskiego">Oksywie Godebskiego</option>
                        <option value="Oksywie G??rne">Oksywie G??rne</option>
                        <option value="Olgierda">Olgierda</option>
                        <option value="Olimpijska">Olimpijska</option>
                        <option value="Oliwa - P??tla Tramwajowa">Oliwa - P??tla Tramwajowa</option>
                        <option value="Oliwa PKP">Oliwa PKP</option>
                        <option value="Oliwa ZOO">Oliwa ZOO</option>
                        <option value="Olkuska - Radomska">Olkuska - Radomska</option>
                        <option value="Olkuska - ??owicka">Olkuska - ??owicka</option>
                        <option value="Olszty??ska">Olszty??ska</option>
                        <option value="Olszynka - Niwki">Olszynka - Niwki</option>
                        <option value="Olszynka - Szko??a">Olszynka - Szko??a</option>
                        <option value="Olszy??ska">Olszy??ska</option>
                        <option value="Opacka">Opacka</option>
                        <option value="Opera Ba??tycka">Opera Ba??tycka</option>
                        <option value="Opolska">Opolska</option>
                        <option value="Oriona">Oriona</option>
                        <option value="Orlinki">Orlinki</option>
                        <option value="Ornitolog??w">Ornitolog??w</option>
                        <option value="Orunia G??rna">Orunia G??rna</option>
                        <option value="Or??owo SKM - Klif">Or??owo SKM - "Klif"</option>
                        <option value="Or??owo SKM - Or??owska">Or??owo SKM - Or??owska</option>
                        <option value="Osiedle Barniewice">Osiedle Barniewice</option>
                        <option value="Osiedle Bursztynowe">Osiedle Bursztynowe</option>
                        <option value="Osiedle Cytrusowe">Osiedle Cytrusowe</option>
                        <option value="Osiedle Jary">Osiedle Jary</option>
                        <option value="Osiedle Kasprowicza">Osiedle Kasprowicza</option>
                        <option value="Osiedle Kr??lewskie">Osiedle Kr??lewskie</option>
                        <option value="Osiedle Mickiewicza">Osiedle Mickiewicza</option>
                        <option value="Osiedle Olimp">Osiedle Olimp</option>
                        <option value="Osiedle Piastowskie">Osiedle Piastowskie</option>
                        <option value="Osiedle Wejhera">Osiedle Wejhera</option>
                        <option value="Osiedle Wsch??d">Osiedle Wsch??d</option>
                        <option value="Osiedle ??wi??tokrzyskie">Osiedle ??wi??tokrzyskie</option>
                        <option value="Osowa Obwodnica">Osowa Obwodnica</option>
                        <option value="Osowa PKP">Osowa PKP</option>
                        <option value="Osowa Przesypownia">Osowa Przesypownia</option>
                        <option value="Ostroroga">Ostroroga</option>
                        <option value="Ostr????ek">Ostr????ek</option>
                        <option value="Otomin - P??tla">Otomin - P??tla</option>
                        <option value="Otomi??ska">Otomi??ska</option>
                        <option value="Otwarta">Otwarta</option>
                        <option value="Owczarnia">Owczarnia</option>
                        <option value="Owsiana">Owsiana</option>
                        <option value="PCK">PCK</option>
                        <option value="Paderewskiego">Paderewskiego</option>
                        <option value="Pag??rkowa">Pag??rkowa</option>
                        <option value="Panattoni">Panattoni</option>
                        <option value="Pancerna">Pancerna</option>
                        <option value="Paprykowa">Paprykowa</option>
                        <option value="Park Naukowo - Technologiczny">Park Naukowo - Technologiczny</option>
                        <option value="Park Rady Europy">Park Rady Europy</option>
                        <option value="Park Reagana">Park Reagana</option>
                        <option value="Partyzant??w - Ko??ciuszki">Partyzant??w - Ko??ciuszki</option>
                        <option value="Paska">Paska</option>
                        <option value="Pastelowa">Pastelowa</option>
                        <option value="Piaskowa">Piaskowa</option>
                        <option value="Piastowska">Piastowska</option>
                        <option value="Piecewska">Piecewska</option>
                        <option value="Piekarnicza">Piekarnicza</option>
                        <option value="Pieleszewo SKM">Pieleszewo SKM</option>
                        <option value="Pierwoszyno - Ko??ci????">Pierwoszyno - Ko??ci????</option>
                        <option value="Pierwoszyno - Staw">Pierwoszyno - Staw</option>
                        <option value="Pie??kawy">Pie??kawy</option>
                        <option value="Pilot??w">Pilot??w</option>
                        <option value="Piotrkowska">Piotrkowska</option>
                        <option value="Pio??unowa">Pio??unowa</option>
                        <option value="Pi??sudskiego">Pi??sudskiego</option>
                        <option value="Plac Afrodyty">Plac Afrodyty</option>
                        <option value="Plac G??rno??l??ski">Plac G??rno??l??ski</option>
                        <option value="Plac Kaszubski">Plac Kaszubski</option>
                        <option value="Plac Kaszubski - Jana z Kolna">Plac Kaszubski - Jana z Kolna</option>
                        <option value="Plac Kaszubski - ??wi??toja??ska">Plac Kaszubski - ??wi??toja??ska
                        </option>
                        <option value="Plac Komorowskiego">Plac Komorowskiego</option>
                        <option value="Plac Kusoci??skiego">Plac Kusoci??skiego</option>
                        <option value="Plac Neptuna">Plac Neptuna</option>
                        <option value="Plac Solidarno??ci">Plac Solidarno??ci</option>
                        <option value="Plac Wolno??ci">Plac Wolno??ci</option>
                        <option value="Platynowa">Platynowa</option>
                        <option value="Pla??a ??r??dmie??cie - Muzeum Miasta Gdyni">Pla??a ??r??dmie??cie - Muzeum Miasta Gdyni</option>
                        <option value="Pocztowa">Pocztowa</option>
                        <option value="Podg??rska">Podg??rska</option>
                        <option value="Podkarpacka">Podkarpacka</option>
                        <option value="Podle??na">Podle??na</option>
                        <option value="Podmok??a">Podmok??a</option>
                        <option value="Pogotowie Ratunkowe">Pogotowie Ratunkowe</option>
                        <option value="Pog??rze - Derdowskiego">Pog??rze - Derdowskiego</option>
                        <option value="Pog??rze - Dobke">Pog??rze - Dobke</option>
                        <option value="Pog??rze - Herbert">Pog??rze - Herberta</option>
                        <option value="Pog??rze - Majakowskiego">Pog??rze - Majakowskiego</option>
                        <option value="Pog??rze - Pog??rze G??rne">Pog??rze - Pog??rze G??rne</option>
                        <option value="Pog??rze - Pu??askiego">Pog??rze - Pu??askiego</option>
                        <option value="Pog??rze - Szkolna">Pog??rze - Szkolna</option>
                        <option value="Pog??rze - S??owackiego">Pog??rze - S??owackiego</option>
                        <option value="Pog??rze Dolne">Pog??rze Dolne</option>
                        <option value="Pog??rze Dolne Z??ota">Pog??rze Dolne Z??ota</option>
                        <option value="Pog??rze G??rne">Pog??rze G??rne</option>
                        <option value="Pohulanka">Pohulanka</option>
                        <option value="Pok??adowa">Pok??adowa</option>
                        <option value="Pole Namiotowe">Pole Namiotowe</option>
                        <option value="Politechnika">Politechnika</option>
                        <option value="Politechnika SKM">Politechnika SKM</option>
                        <option value="Polna">Polna</option>
                        <option value="Pomorska - Gda??ska">Pomorska - Gda??ska</option>
                        <option value="Pomorska - Osiedle">Pomorska - Osiedle</option>
                        <option value="Pomorska [GDA]">Pomorska [GDA]</option>
                        <option value="Pomorska [RU]">Pomorska [RU]</option>
                        <option value="Pomorskie Szko??y Rzemios??">Pomorskie Szko??y Rzemios??</option>
                        <option value="Porazi??skiej">Porazi??skiej</option>
                        <option value="Port Lotniczy">Port Lotniczy</option>
                        <option value="Portowa">Portowa</option>
                        <option value="Por??bskiego">Por??bskiego</option>
                        <option value="Potok Wiczli??ski">Potok Wiczli??ski</option>
                        <option value="Potokowa">Potokowa</option>
                        <option value="Potokowa - Matemblewska">Potokowa - Matemblewska</option>
                        <option value="Pot??gowska">Pot??gowska</option>
                        <option value="Powsta?? Ch??opskich">Powsta?? Ch??opskich</option>
                        <option value="Powsta??c??w Warszawskich">Powsta??c??w Warszawskich</option>
                        <option value="Powsta??c??w Warszawy">Powsta??c??w Warszawy</option>
                        <option value="Pozna??ska">Pozna??ska</option>
                        <option value="Po??czy??ska">Po??czy??ska</option>
                        <option value="Prusa">Prusa</option>
                        <option value="Pruszcz Gda??ski S??owackiego">Pruszcz Gda??ski S??owackiego</option>
                        <option value="Pruszkowskiego">Pruszkowskiego</option>
                        <option value="Przebi??niegowa">Przebi??niegowa</option>
                        <option value="Przegalina">Przegalina</option>
                        <option value="Przegali??ska">Przegali??ska</option>
                        <option value="Przegali??ska - Schronisko">Przegali??ska - Schronisko</option>
                        <option value="Przejazd Kolejowy">Przejazd Kolejowy</option>
                        <option value="Przemian">Przemian</option>
                        <option value="Przemyska">Przemyska</option>
                        <option value="Przemys??owa">Przemys??owa</option>
                        <option value="Przer??bka">Przer??bka</option>
                        <option value="Przesypownia">Przesypownia</option>
                        <option value="Przetoczna">Przetoczna</option>
                        <option value="Przybrze??na">Przybrze??na</option>
                        <option value="Przychodnia">Przychodnia</option>
                        <option value="Przylesie">Przylesie</option>
                        <option value="Przymorze SKM">Przymorze SKM</option>
                        <option value="Przymorze Wielkie">Przymorze Wielkie</option>
                        <option value="Przyrodnik??w">Przyrodnik??w</option>
                        <option value="Przyrzeczna">Przyrzeczna</option>
                        <option value="Przysta??">Przysta??</option>
                        <option value="Przysta?? ??eglugi">Przysta?? ??eglugi</option>
                        <option value="Przytulna">Przytulna</option>
                        <option value="Przywidzka">Przywidzka</option>
                        <option value="Pszenna">Pszenna</option>
                        <option value="Ptasia">Ptasia</option>
                        <option value="Pucka">Pucka</option>
                        <option value="Pucka - Hutnicza">Pucka - Hutnicza</option>
                        <option value="Pucka - Przejazd Kolejowy">Pucka - Przejazd Kolejowy</option>
                        <option value="Pustki Cisowskie">Pustki Cisowskie</option>
                        <option value="P??lnicy">P??lnicy</option>
                        <option value="P??powo">P??powo</option>
                        <option value="P??ocka">P??ocka</option>
                        <option value="P??owce">P??owce</option>
                        <option value="P??o??ska">P??o??ska</option>
                        <option value="P??yta Red??owska">P??yta Red??owska</option>
                        <option value="Rac??awicka">Rac??awicka</option>
                        <option value="Radarowa">Radarowa</option>
                        <option value="Radiowa">Radiowa</option>
                        <option value="Radunica">Radunica</option>
                        <option value="Radu??ska">Radu??ska</option>
                        <option value="Rafineria">Rafineria</option>
                        <option value="Rakietowa">Rakietowa</option>
                        <option value="Rdestowa - Chwaszczy??ska">Rdestowa - Chwaszczy??ska</option>
                        <option value="Rdestowa - Le??ny Zak??tek">Rdestowa - Le??ny Zak??tek</option>
                        <option value="Reda Aquapark">Reda Aquapark</option>
                        <option value="Reda Dworzec PKP">Reda Dworzec PKP</option>
                        <option value="Red??owo SKM">Red??owo SKM</option>
                        <option value="Red??owo SKM - Park Technologiczny">Red??owo SKM - Park Technologiczny
                        </option>
                        <option value="Red??owo Szpital">Red??owo Szpital</option>
                        <option value="Reformacka">Reformacka</option>
                        <option value="Reja [GDA]">Reja [GDA]</option>
                        <option value="Reja [RU]">Reja [RU]</option>
                        <option value="Rejenta">Rejenta</option>
                        <option value="Rejtana">Rejtana</option>
                        <option value="Rewa - Bosma??ska">Rewa - Bosma??ska</option>
                        <option value="Rewa - Bursztynowa">Rewa - Bursztynowa</option>
                        <option value="Rewa - S??oneczna">Rewa - S??oneczna</option>
                        <option value="Rewa - Wroc??awska">Rewa - Wroc??awska</option>
                        <option value="Reymonta [GDA]">Reymonta [GDA]</option>
                        <option value="Reymonta [PG]">Reymonta [PG]</option>
                        <option value="Rogali??ska">Rogali??ska</option>
                        <option value="Rogozi??skiego">Rogozi??skiego</option>
                        <option value="Rolnicza">Rolnicza</option>
                        <option value="Rondo Bursztynowe">Rondo Bursztynowe</option>
                        <option value="Rondo Jana Paw??a II">Rondo Jana Paw??a II</option>
                        <option value="Rondo Kaszubskie">Rondo Kaszubskie</option>
                        <option value="Rondo Kociewskie">Rondo Kociewskie</option>
                        <option value="Rotmanka - Rondo">Rotmanka - Rondo</option>
                        <option value="Rotterdamska">Rotterdamska</option>
                        <option value="Rozewska">Rozewska</option>
                        <option value="Rozstaje">Rozstaje</option>
                        <option value="Roz??ogi">Roz??ogi</option>
                        <option value="Ruchu Oporu">Ruchu Oporu</option>
                        <option value="Rumia Dworzec PKP">Rumia Dworzec PKP</option>
                        <option value="Rumia Dworzec PKP - Towarowa">Rumia Dworzec PKP - Towarowa</option>
                        <option value="Rumia Partyzant??w">Rumia Partyzant??w</option>
                        <option value="Rumia Szmelta">Rumia Szmelta</option>
                        <option value="Rybacka [GDA]">Rybacka [GDA]</option>
                        <option value="Rybacka [WEJ]">Rybacka [WEJ]</option>
                        <option value="Rybaki G??rne">Rybaki G??rne</option>
                        <option value="Rybi??skiego">Rybi??skiego</option>
                        <option value="Rybo??owc??w">Rybo??owc??w</option>
                        <option value="Rynarzewo">Rynarzewo</option>
                        <option value="Rynek Non-Stop">Rynek Non-Stop</option>
                        <option value="Rzeczypospolitej">Rzeczypospolitej</option>
                        <option value="R??wna">R??wna</option>
                        <option value="R??biechowo PKP">R??biechowo PKP</option>
                        <option value="R??biechowo Piaskowa">R??biechowo Piaskowa</option>
                        <option value="R??bowo">R??bowo</option>
                        <option value="SDO Z??ota Jesie??">SDO "Z??ota Jesie??"</option>
                        <option value="Sabata - Szko??a">Sabata - Szko??a</option>
                        <option value="Sambora">Sambora</option>
                        <option value="Sanatorium Le??nik">Sanatorium "Le??nik"</option>
                        <option value="Sandomierska">Sandomierska</option>
                        <option value="Sarnia">Sarnia</option>
                        <option value="Saturna">Saturna</option>
                        <option value="Schronisko Sopotkowo">Schronisko Sopotkowo</option>
                        <option value="Schronisko dla zwierz??t Promyk">Schronisko dla zwierz??t "Promyk"
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
                        <option value="Skar??y??skiego">Skar??y??skiego</option>
                        <option value="Skrajna">Skrajna</option>
                        <option value="Skwer Ko??ciuszki - InfoBox">Skwer Ko??ciuszki - InfoBox</option>
                        <option value="Smolna">Smolna</option>
                        <option value="Smoluchowskiego">Smoluchowskiego</option>
                        <option value="Sm??gorzyno">Sm??gorzyno</option>
                        <option value="Sobieskiego - FUO">Sobieskiego - FUO</option>
                        <option value="Sobieskiego - Przychodnia">Sobieskiego - Przychodnia</option>
                        <option value="Sobieszewko">Sobieszewko</option>
                        <option value="Sobieszewko O??rodek">Sobieszewko O??rodek</option>
                        <option value="Sobieszewo">Sobieszewo</option>
                        <option value="Sobieszewska">Sobieszewska</option>
                        <option value="Sobieszewska Pastwa 1">Sobieszewska Pastwa 1</option>
                        <option value="Sobieszewska Pastwa 2">Sobieszewska Pastwa 2</option>
                        <option value="Sob??tki">Sob??tki</option>
                        <option value="Soko??a">Soko??a</option>
                        <option value="Soplicy">Soplicy</option>
                        <option value="Sopocka">Sopocka</option>
                        <option value="Sopot 3 Maja (N/??)">Sopot 3 Maja (N/??)</option>
                        <option value="Sopot Brodwino (N/??)">Sopot Brodwino (N/??)</option>
                        <option value="Sopot Brodwino Szko??a (N/??)">Sopot Brodwino Szko??a (N/??)</option>
                        <option value="Sopot Goyki">Sopot Goyki</option>
                        <option value="Sopot Junak??w (N/??)">Sopot Junak??w (N/??)</option>
                        <option value="Sopot Kasztanowa">Sopot Kasztanowa</option>
                        <option value="Sopot Kolberga (N/??)">Sopot Kolberga (N/??)</option>
                        <option value="Sopot Kraszewskiego (N/??)">Sopot Kraszewskiego (N/??)</option>
                        <option value="Sopot Malczewskiego">Sopot Malczewskiego</option>
                        <option value="Sopot Ma??opolska (N/??)">Sopot Ma??opolska (N/??)</option>
                        <option value="Sopot PKP">Sopot PKP</option>
                        <option value="Sopot PKP - Marynarzy">Sopot PKP - Marynarzy</option>
                        <option value="Sopot PKP - Niepodleg??o??ci">Sopot PKP - Niepodleg??o??ci</option>
                        <option value="Sopot Reja">Sopot Reja</option>
                        <option value="Sosnowiecka">Sosnowiecka</option>
                        <option value="So??dka">So??dka</option>
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
                        <option value="Stara Pi??a">Stara Pi??a</option>
                        <option value="Stara Rumia Cmentarz">Stara Rumia Cmentarz</option>
                        <option value="Stare Ob??u??e">Stare Ob??u??e</option>
                        <option value="Stare Szkoty">Stare Szkoty</option>
                        <option value="Starochwaszczy??ska">Starochwaszczy??ska</option>
                        <option value="Starogardzka">Starogardzka</option>
                        <option value="Starowiejska - Poczta">Starowiejska - Poczta</option>
                        <option value="Starowiejska [GDA]">Starowiejska [GDA]</option>
                        <option value="Starowiejska [GDY]">Starowiejska [GDY]</option>
                        <option value="Startowa">Startowa</option>
                        <option value="Staw Wr??bla">Staw Wr??bla</option>
                        <option value="Stawna">Stawna</option>
                        <option value="Steczka">Steczka</option>
                        <option value="Sternicza">Sternicza</option>
                        <option value="Steyera">Steyera</option>
                        <option value="Stocznia Gdynia">Stocznia Gdynia</option>
                        <option value="Stocznia P????nocna">Stocznia P????nocna</option>
                        <option value="Stocznia SKM">Stocznia SKM</option>
                        <option value="Stocznia SKM - Morska">Stocznia SKM - Morska</option>
                        <option value="Stocznia Wojenna">Stocznia Wojenna</option>
                        <option value="Stoczniowc??w">Stoczniowc??w</option>
                        <option value="Stogi">Stogi</option>
                        <option value="Stogi Pla??a">Stogi Pla??a</option>
                        <option value="Stoigniewa">Stoigniewa</option>
                        <option value="Stokrotki">Stokrotki</option>
                        <option value="Stok??osy">Stok??osy</option>
                        <option value="Stolarska">Stolarska</option>
                        <option value="Stolema">Stolema</option>
                        <option value="Strzelecka">Strzelecka</option>
                        <option value="Strzelnica">Strzelnica</option>
                        <option value="Strzy??a PKM">Strzy??a PKM</option>
                        <option value="St????ycka">St????ycka</option>
                        <option value="Subis??awa">Subis??awa</option>
                        <option value="Suchanino">Suchanino</option>
                        <option value="Sucharskiego">Sucharskiego</option>
                        <option value="Sucharskiego - PKP">Sucharskiego - PKP</option>
                        <option value="Suchy Dw??r - Borchardta">Suchy Dw??r - Borchardta</option>
                        <option value="Suchy Dw??r - Gombrowicza">Suchy Dw??r - Gombrowicza</option>
                        <option value="Suchy Dw??r - Kochanowskiego">Suchy Dw??r - Kochanowskiego</option>
                        <option value="Suchy Dw??r - Necla">Suchy Dw??r - Necla</option>
                        <option value="Suchy Dw??r - Reja">Suchy Dw??r - Reja</option>
                        <option value="Suchy Dw??r - Szkolna">Suchy Dw??r - Szkolna</option>
                        <option value="Sulmin">Sulmin</option>
                        <option value="Sulmi??ska">Sulmi??ska</option>
                        <option value="Swarzewska I">Swarzewska I</option>
                        <option value="Swarzewska II">Swarzewska II</option>
                        <option value="Swojska">Swojska</option>
                        <option value="Szad????ki">Szad????ki</option>
                        <option value="Szad????ki Obwodnica">Szad????ki Obwodnica</option>
                        <option value="Szafranowa">Szafranowa</option>
                        <option value="Szczeblewskiego">Szczeblewskiego</option>
                        <option value="Szczeci??ska">Szczeci??ska</option>
                        <option value="Szcz????liwa">Szcz????liwa</option>
                        <option value="Szemud">Szemud</option>
                        <option value="Szemud - B??aszkowskiego">Szemud - B??aszkowskiego</option>
                        <option value="Szemud - Cmentarz">Szemud - Cmentarz</option>
                        <option value="Szemud - Lesiniec">Szemud - Lesiniec</option>
                        <option value="Szemud - Moczyd??a">Szemud - Moczyd??a</option>
                        <option value="Szemud - Remiza">Szemud - Remiza</option>
                        <option value="Szkolna">Szkolna</option>
                        <option value="Szko??a Metropolitalna">Szko??a Metropolitalna</option>
                        <option value="Szko??a Morska">Szko??a Morska</option>
                        <option value="Szko??a Podstawowa nr 6">Szko??a Podstawowa nr 6</option>
                        <option value="Szlachecka">Szlachecka</option>
                        <option value="Szpital Marynarki Wojennej">Szpital Marynarki Wojennej</option>
                        <option value="Szpital Zaka??ny">Szpital Zaka??ny</option>
                        <option value="Sztutowska">Sztutowska</option>
                        <option value="Szybowcowa">Szybowcowa</option>
                        <option value="S??wki">S??wki</option>
                        <option value="S??siedzka">S??siedzka</option>
                        <option value="S??owackiego">S??owackiego</option>
                        <option value="S??owackiego Dzia??ki">S??owackiego Dzia??ki</option>
                        <option value="Tarcice">Tarcice</option>
                        <option value="Tatrza??ska - Olszty??ska">Tatrza??ska - Olszty??ska</option>
                        <option value="Teatr Miniatura / Radio Gda??sk">Teatr Miniatura / Radio Gda??sk</option>
                        <option value="Technikum Ch??odnicze">Technikum Ch??odnicze</option>
                        <option value="Telewizyjna">Telewizyjna</option>
                        <option value="Terminal - Cargo">Terminal - Cargo</option>
                        <option value="Terminal DCT">Terminal DCT</option>
                        <option value="Terminal Promowy">Terminal Promowy</option>
                        <option value="Tetmajera">Tetmajera</option>
                        <option value="Tezeusza">Tezeusza</option>
                        <option value="Topazowa">Topazowa</option>
                        <option value="Toru??ska">Toru??ska</option>
                        <option value="Trakt Gda??ski">Trakt Gda??ski</option>
                        <option value="Trakt Konny">Trakt Konny</option>
                        <option value="Transportowc??w">Transportowc??w</option>
                        <option value="Traugutta">Traugutta</option>
                        <option value="Traugutta [GDA]">Traugutta [GDA]</option>
                        <option value="Traugutta [GDY]">Traugutta [GDY]</option>
                        <option value="Trawki">Trawki</option>
                        <option value="Tra??owa - Szko??a">Tra??owa - Szko??a</option>
                        <option value="Tuchom - Ogrodowa">Tuchom - Ogrodowa</option>
                        <option value="Tuchom - T??czowa">Tuchom - T??czowa</option>
                        <option value="Tuchom - Warzenko">Tuchom - Warzenko</option>
                        <option value="Turkusowa">Turkusowa</option>
                        <option value="Turystyczna">Turystyczna</option>
                        <option value="Twarda">Twarda</option>
                        <option value="Tymiankowa">Tymiankowa</option>
                        <option value="Tysi??clecia">Tysi??clecia</option>
                        <option value="T??czowa">T??czowa</option>
                        <option value="Uczniowska [GDA]">Uczniowska [GDA]</option>
                        <option value="Uczniowska [GDY]">Uczniowska [GDY]</option>
                        <option value="Ugory eMOCja">Ugory eMOCja</option>
                        <option value="Uje??cisko">Uje??cisko</option>
                        <option value="Uko??na">Uko??na</option>
                        <option value="Unimor">Unimor</option>
                        <option value="Uniwersyteckie Centrum Kliniczne">Uniwersyteckie Centrum Kliniczne</option>
                        <option value="Uniwersytet Gda??ski [GDA]">Uniwersytet Gda??ski [GDA]</option>
                        <option value="Uniwersytet Gda??ski [SOP]">Uniwersytet Gda??ski [SOP]</option>
                        <option value="Uniwersytet Medyczny">Uniwersytet Medyczny</option>
                        <option value="Uniwersytet Morski">Uniwersytet Morski</option>
                        <option value="Uniwersytet Morski (linia 102)">Uniwersytet Morski (linia 102)</option>
                        <option value="Uphagena">Uphagena</option>
                        <option value="Uranowa">Uranowa</option>
                        <option value="Urz??d Dozoru Technicznego">Urz??d Dozoru Technicznego</option>
                        <option value="Urz??d Miasta - W??adys??awa IV">Urz??d Miasta - W??adys??awa IV
                        </option>
                        <option value="Urz??d Miasta - ??wi??toja??ska">Urz??d Miasta - ??wi??toja??ska
                        </option>
                        <option value="Urz??d Miasta Rumi">Urz??d Miasta Rumi</option>
                        <option value="Urz??d Miejski">Urz??d Miejski</option>
                        <option value="Urz??d Morski">Urz??d Morski</option>
                        <option value="Urz??d Pracy">Urz??d Pracy</option>
                        <option value="Urz??d Skarbowy">Urz??d Skarbowy</option>
                        <option value="Urz??d Wojew??dzki / Marsza??kowski">Urz??d Wojew??dzki /
                            Marsza??kowski
                        </option>
                        <option value="Uzdrowiskowa">Uzdrowiskowa</option>
                        <option value="Wagnera">Wagnera</option>
                        <option value="Wal??ga">Wal??ga</option>
                        <option value="Warne??ska">Warne??ska</option>
                        <option value="Warszawska">Warszawska</option>
                        <option value="Wa??y Piastowskie">Wa??y Piastowskie</option>
                        <option value="Wczasy">Wczasy</option>
                        <option value="Wejherowo Szpital">Wejherowo Szpital</option>
                        <option value="Wejherowska">Wejherowska</option>
                        <option value="Westerplatte">Westerplatte</option>
                        <option value="Wiczlino Dzia??ki I">Wiczlino Dzia??ki I</option>
                        <option value="Wiczlino Dzia??ki II">Wiczlino Dzia??ki II</option>
                        <option value="Wiczlino Niemotowo">Wiczlino Niemotowo</option>
                        <option value="Wiczlino Skrzy??owanie">Wiczlino Skrzy??owanie</option>
                        <option value="Wiczli??ska - Las">Wiczli??ska - Las</option>
                        <option value="Wiczli??ska - ??liska">Wiczli??ska - ??liska</option>
                        <option value="Wiejska">Wiejska</option>
                        <option value="Wielki Kack Fikakowo">Wielki Kack Fikakowo</option>
                        <option value="Wielki Kack Starodworcowa">Wielki Kack Starodworcowa</option>
                        <option value="Wielu??ska - Lipnowska">Wielu??ska - Lipnowska</option>
                        <option value="Wielu??ska - Radomska">Wielu??ska - Radomska</option>
                        <option value="Wieniecka">Wieniecka</option>
                        <option value="Wierzbowa">Wierzbowa</option>
                        <option value="Wie??ycka">Wie??ycka</option>
                        <option value="Wiklinowa">Wiklinowa</option>
                        <option value="Wilanowska">Wilanowska</option>
                        <option value="Wile??ska">Wile??ska</option>
                        <option value="Wiosny Lud??w">Wiosny Lud??w</option>
                        <option value="Witomino Centrum">Witomino Centrum</option>
                        <option value="Witomino Le??nicz??wka">Witomino Le??nicz??wka</option>
                        <option value="Witomino Polna">Witomino Polna</option>
                        <option value="Witomino Sosnowa">Witomino Sosnowa</option>
                        <option value="Witomi??ska">Witomi??ska</option>
                        <option value="Wi??linka Piaskowa">Wi??linka Piaskowa</option>
                        <option value="Wi??niewskiego">Wi??niewskiego</option>
                        <option value="Wodnika">Wodnika</option>
                        <option value="Wojska Polskiego">Wojska Polskiego</option>
                        <option value="Wolno??ci - II LO">Wolno??ci - II LO</option>
                        <option value="Worcella">Worcella</option>
                        <option value="Wo??kowyska">Wo??kowyska</option>
                        <option value="Wronki">Wronki</option>
                        <option value="Wrzeszcz PKP">Wrzeszcz PKP</option>
                        <option value="Wrzosowe Wzg??rze">Wrzosowe Wzg??rze</option>
                        <option value="Wr??bla">Wr??bla</option>
                        <option value="Wybickiego [GDY]">Wybickiego [GDY]</option>
                        <option value="Wybickiego [RU]">Wybickiego [RU]</option>
                        <option value="Wybickiego [SOP]">Wybickiego [SOP]</option>
                        <option value="Wycz????kowskiego">Wycz????kowskiego</option>
                        <option value="Wyspia??skiego">Wyspia??skiego</option>
                        <option value="Wyzwolenia">Wyzwolenia</option>
                        <option value="Wzg??rze ??w. Maksymiliana -  Kapliczka">Wzg??rze ??w. Maksymiliana -  Kapliczka</option>
                        <option value="Wzg??rze ??w. Maksymiliana SKM">Wzg??rze ??w. Maksymiliana SKM</option>
                        <option value="Wzg??rze ??w. Maksymiliana Syrokomli">Wzg??rze ??w. Maksymiliana
                            Syrokomli
                        </option>
                        <option value="W??w??z Ostrowicki">W??w??z Ostrowicki</option>
                        <option value="W??gorzowa">W??gorzowa</option>
                        <option value="W??ze?? Elbl??ska">W??ze?? Elbl??ska</option>
                        <option value="W??ze?? Franciszki Cegielskiej">W??ze?? Franciszki Cegielskiej</option>
                        <option value="W??ze?? Groddecka">W??ze?? Groddecka</option>
                        <option value="W??ze?? Harfa">W??ze?? Harfa</option>
                        <option value="W??ze?? Karczemki">W??ze?? Karczemki</option>
                        <option value="W??ze?? Kliniczna">W??ze?? Kliniczna</option>
                        <option value="W??ze?? Lipce">W??ze?? Lipce</option>
                        <option value="W??ze?? Ofiar Grudnia '70">W??ze?? Ofiar Grudnia '70</option>
                        <option value="W??ze?? ??o??nierzy Wykl??tych">W??ze?? ??o??nierzy Wykl??tych
                        </option>
                        <option value="W??adys??awa IV [GDA]">W??adys??awa IV [GDA]</option>
                        <option value="W??adys??awa IV [SOP]">W??adys??awa IV [SOP]</option>
                        <option value="Zabornia">Zabornia</option>
                        <option value="Zabytkowa">Zabytkowa</option>
                        <option value="Zacna">Zacna</option>
                        <option value="Zagony">Zagony</option>
                        <option value="Zagroble">Zagroble</option>
                        <option value="Zajezdnia">Zajezdnia</option>
                        <option value="Zajezdnia NOWY PORT">Zajezdnia NOWY PORT</option>
                        <option value="Zajezdnia WRZESZCZ">Zajezdnia WRZESZCZ</option>
                        <option value="Zakoniczyn">Zakoniczyn</option>
                        <option value="Zakopia??ska">Zakopia??ska</option>
                        <option value="Zak??ad Utylizacyjny">Zak??ad Utylizacyjny</option>
                        <option value="Zamenhofa [GDA]">Zamenhofa [GDA]</option>
                        <option value="Zamenhofa [GDY]">Zamenhofa [GDY]</option>
                        <option value="Zapolskiej">Zapolskiej</option>
                        <option value="Zaro??lak">Zaro??lak</option>
                        <option value="Zaruskiego">Zaruskiego</option>
                        <option value="Zaspa">Zaspa</option>
                        <option value="Zaspa - Szpital">Zaspa - Szpital</option>
                        <option value="Zaspa SKM">Zaspa SKM</option>
                        <option value="Zastawna">Zastawna</option>
                        <option value="Zawodzie">Zawodzie</option>
                        <option value="Zbie??na">Zbie??na</option>
                        <option value="Zbo??owa">Zbo??owa</option>
                        <option value="Zdrojowa">Zdrojowa</option>
                        <option value="Zesp???? Szk???? Morskich">Zesp???? Szk???? Morskich</option>
                        <option value="Zeusa">Zeusa</option>
                        <option value="Zielona - Dzia??ki I">Zielona - Dzia??ki I</option>
                        <option value="Zielona - Dzia??ki II">Zielona - Dzia??ki II</option>
                        <option value="Zielona - Ko??ci????">Zielona - Ko??ci????</option>
                        <option value="Zielony Stok">Zielony Stok</option>
                        <option value="Zimna">Zimna</option>
                        <option value="Zosi">Zosi</option>
                        <option value="Zwierzyniecka">Zwierzyniecka</option>
                        <option value="Zwinis??awy">Zwinis??awy</option>
                        <option value="Zwyci??stwa - Wielkopolska">Zwyci??stwa - Wielkopolska</option>
                        <option value="Z??ota">Z??ota</option>
                        <option value="Z??ota Karczma">Z??ota Karczma</option>
                        <option value="al. P??a??y??skiego">al. P??a??y??skiego</option>
                        <option value="??ab??dzia">??ab??dzia</option>
                        <option value="??agowska">??agowska</option>
                        <option value="??anowa I">??anowa I</option>
                        <option value="??anowa II">??anowa II</option>
                        <option value="??anowa III">??anowa III</option>
                        <option value="??anowa IV">??anowa IV</option>
                        <option value="??api??ska">??api??ska</option>
                        <option value="??okietka">??okietka</option>
                        <option value="??ostowice ??wi??tokrzyska">??ostowice ??wi??tokrzyska</option>
                        <option value="??owicka - Szko??a">??owicka - Szko??a</option>
                        <option value="??owicka [GDA]">??owicka [GDA]</option>
                        <option value="??owicka [GDY]">??owicka [GDY]</option>
                        <option value="??u??ycka [GDY]">??u??ycka [GDY]</option>
                        <option value="??u??ycka [SOP]">??u??ycka [SOP]</option>
                        <option value="????dzka">????dzka</option>
                        <option value="????kowa">????kowa</option>
                        <option value="????czycka">????czycka</option>
                        <option value="??????yce">??????yce</option>
                        <option value="??????yce - G??od??wko">??????yce - G??od??wko</option>
                        <option value="??????yce - Je??ynowa">??????yce - Je??ynowa</option>
                        <option value="??????yce - Limbowa">??????yce - Limbowa</option>
                        <option value="Topolowa"> Topolowa</option>
                        <option value="??ciegiennego">??ciegiennego</option>
                        <option value="??luza">??luza</option>
                        <option value="??l??ska">??l??ska</option>
                        <option value="??miechowo Ogrodowa">??miechowo Ogrodowa</option>
                        <option value="??miechowo SKM - Ceynowy">??miechowo SKM - Ceynowy</option>
                        <option value="??nie??na">??nie??na</option>
                        <option value="??r??dmie??cie SKM">??r??dmie??cie SKM</option>
                        <option value="??w. Brata Alberta">??w. Brata Alberta</option>
                        <option value="??w. Wojciech">??w. Wojciech</option>
                        <option value="??wibnie??ska I">??wibnie??ska I</option>
                        <option value="??wibnie??ska II">??wibnie??ska II</option>
                        <option value="??wibnie??ska III">??wibnie??ska III</option>
                        <option value="??witezianki">??witezianki</option>
                        <option value="??wi??tokrzyska">??wi??tokrzyska</option>
                        <option value="??wi??tope??ka">??wi??tope??ka</option>
                        <option value="??r??dlana">??r??dlana</option>
                        <option value="??r??d??o Marii">??r??d??o Marii</option>
                        <option value="??abi Kruk">??abi Kruk</option>
                        <option value="??abianka SKM">??abianka SKM</option>
                        <option value="??aglowa - AmberExpo">??aglowa - AmberExpo</option>
                        <option value="??arnowiecka">??arnowiecka</option>
                        <option value="??elazna">??elazna</option>
                        <option value="??eliwna">??eliwna</option>
                        <option value="??eromskiego [RU]">??eromskiego [RU]</option>
                        <option value="??eromskiego [SOP]">??eromskiego [SOP]</option>
                        <option value="??o??nierzy I Dywizji WP">??o??nierzy I Dywizji WP</option>
                        <option value="??ukowo - Baza PA Gryf">??ukowo - Baza PA "Gryf"</option>
                        <option value="??ukowo - Dworcowa">??ukowo - Dworcowa</option>
                        <option value="??ukowo - Fenikowskiego">??ukowo - Fenikowskiego</option>
                        <option value="??ukowo - Os. Norbertanek">??ukowo - Os. Norbertanek</option>
                        <option value="??ukowo - S??oneczna">??ukowo - S??oneczna</option>
                        <option value="??ukowo - Urz??d Gminy">??ukowo - Urz??d Gminy</option>
                        <option value="??urawia">??urawia</option>
                        <option value="??wirki i Wigury [GDA]">??wirki i Wigury [GDA]</option>
                        <option value="??wirki i Wigury [GDY]">??wirki i Wigury [GDY]</option>
                        <option value="??wirki i Wigury [PG]">??wirki i Wigury [PG]</option>
                        <option value="??wirki i Wigury [RU]">??wirki i Wigury [RU]</option>
                        <option value="??yczliwa">??yczliwa</option>
                    </select>
                    <button className="ml-5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                            type="submit">Szukaj odjazd??w!
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