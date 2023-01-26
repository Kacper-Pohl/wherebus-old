import $ from 'jquery';
import React, { useState } from "react";

function setClock()
{
    let dt = new Date();
    let time = (dt.getHours() < 10 ? '0' : '') + dt.getHours() + ":" + (dt.getMinutes() < 10 ? '0' : '') + dt.getMinutes() + ":" + (dt.getSeconds() < 10 ? '0' : '') + dt.getSeconds() + "";

    $( '#Clock' ).html( time );
}
$( document ).ready( setClock );
setInterval( setClock, 1000 );

function getNearestDate(array) {
    return array.sort((a, b) => new Date(a) - new Date(b));
}

function createTripId(tripId, routeId) {
    return 'R'+routeId+'T'+tripId;
}

function stripKierunek(kierunek) {
    return kierunek.substr(kierunek.indexOf('+')+1, kierunek.length);
}

const rozkladData = [
    {
        linia: "---Wybierz numer linii---",
        kierunki: ['---Wybierz kierunek---']
    },
];

const rozkladData2 = [];

const rozkladData3 = [];

const przystanekGodziny = [];

const namesToRoutes = {};

const namesToTrips = [];

const stopsWithNames = {};

const routes_with_trips = {};

export class BusService {
    dates = [];
    routes = {};
    routes_ids = {};
    routes_with_names = {};
    routes_with_id = {};
    trips = {};
    trips_with_names = {};
    tripListOfRoute = {};
    busy_juz_zpushowane = [];
    stops = {};
    stopsWithIds = {};
    stopsTimes = {};
    stopsTimesWithStops = [];
    getStopTimes() {
        for (let routeId in this.routes_ids) {
            fetch(
                "https://ckan2.multimediagdansk.pl/stopTimes?date=" + this.dates[0] + "&routeId=" + routeId
            )
                .then((res) => res.json())
                .then((body) => {
                    this.setStopTimes(body);
                })
                .catch(err=>{
                    console.log(err)
                });
       }
    }
    setStopTimes(stoptimes) {
        var stopstimes = [];
        var id = stoptimes.stopTimes[0].routeId;
        var trips_for_routes = [];
        for (var i in stoptimes.stopTimes) {
            if (trips_for_routes.includes(stoptimes.stopTimes[i].tripId) === false) trips_for_routes.push(stoptimes.stopTimes[i].tripId);
            stopstimes.push(stoptimes.stopTimes[i]);
        }
        this.stopsTimes[id] = stopstimes;
        for (var t=0; t<trips_for_routes.length; t++) {
            var g = 0;
            var przystankiSorted = [];
            var przystankiSortedIds = [];
            for (var j in stoptimes.stopTimes) {
                if (stoptimes.stopTimes[j].tripId == trips_for_routes[t]){
                    if (przystankiSorted.includes(this.stopsWithIds[stoptimes.stopTimes[j].stopId]) === false) {
                        if (stoptimes.stopTimes[j].stopSequence == g){
                            przystankiSorted.push(this.stopsWithIds[stoptimes.stopTimes[j].stopId]);
                            przystankiSortedIds.push(stoptimes.stopTimes[j].stopId);
                            g++;
                        }
                    }
                }
            }
            var element = {};
            let kierunek = this.trips[createTripId(trips_for_routes[t], stoptimes.stopTimes[j].routeId)];
            if(kierunek.indexOf("+") > -1 || kierunek.indexOf("(") > -1){
                if(kierunek.indexOf("+") > -1) kierunek = stripKierunek(kierunek);
            }
            else {
                continue;
            }
            element.kierunek = kierunek;
            element.przystanek = przystankiSorted;
            var element2 = {};
            element2.kierunek = createTripId(trips_for_routes[t], stoptimes.stopTimes[j].routeId);
            element2.przystanek = przystankiSortedIds;
            if (rozkladData2.includes(element.kierunek) === false){
                rozkladData2.push(element);
                rozkladData3.push(element2);
                namesToTrips[element.kierunek+stoptimes.stopTimes[j].routeId] = trips_for_routes[t];
            }
        }
        for (t=0; t<trips_for_routes.length; t++) {
            let przystanki = rozkladData3.filter(x => x.kierunek === createTripId(trips_for_routes[t], stoptimes.stopTimes[t].routeId)).map(x => x.przystanek);
            przystanki = przystanki[0];
            if(przystanki !== undefined){
                for (var p = 0; p < przystanki.length; p++) {
                    var godzinyOdjazdu = [];
                    for (var k in stoptimes.stopTimes) {
                        if (stoptimes.stopTimes[k].tripId === trips_for_routes[t]){
                            if(stoptimes.stopTimes[k].stopId === przystanki[p]){
                                if (godzinyOdjazdu.includes(stoptimes.stopTimes[k].departureTime) === false) {
                                    godzinyOdjazdu.push(stoptimes.stopTimes[k].departureTime);
                                }
                            }
                        }
                    }
                    var rozklad = {};
                    rozklad.przystanek = (createTripId(trips_for_routes[t], stoptimes.stopTimes[0].routeId)+przystanki[p]);
                    rozklad.godziny = godzinyOdjazdu;
                    if (rozkladData2.includes(rozklad.przystanek) === false) przystanekGodziny.push(rozklad);
                }
            }
        }
    }
    getStops() {
        fetch(
            "https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/4c4025f0-01bf-41f7-a39f-d156d201b82b/download/stops.json"
        )
            .then((res) => res.json())
            .then((body) => {
                this.setStops(body);
                this.getStopTimes();
            })
            .catch(err=>{
                console.log(err)
            });
    }
    setStops(stops) {
        let dates = getNearestDate(Object.keys(stops));
        this.dates = dates;
        if (dates.length > 0) {
            this.stops = stops[dates[0]]?.stops.filter(stop=>stop.stopDesc.indexOf("(techniczny)")===-1)
            this.setStopsWithId();
        } else console.log("Cannot find any stop information");
    }
    setStopsWithId() {
        this.stops.forEach((x) => {
            let stopName = x.stopDesc.replace(" (N/Ż)", "").trimEnd();
            this.stopsWithIds[x.stopId]
                ? this.stopsWithIds[x.stopId].push(stopName)
                : (this.stopsWithIds[x.stopId] = [stopName]);
            stopsWithNames[stopName]
                ? stopsWithNames[stopName].push(x.stopId)
                : (stopsWithNames[stopName] = [x.stopId]);
        });
    }
    getTrips() {
        return fetch(
            "https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/b15bb11c-7e06-4685-964e-3db7775f912f/download/trips.json"
        )
            .then((res) => res.json())
            .then((body) => {
                this.setTrips(body);
                this.showRoutes();
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
                this.trips_with_names[trip.tripHeadsign] = trip.id;
                var tripy = [];
                tripsArray.forEach((tripen) => {
                    if (tripen.routeId == trip.routeId){
                        tripy.push(tripen.tripId);
                    }
                });
                if (this.busy_juz_zpushowane.includes(trip.routeId) === false) routes_with_trips[trip.routeId] = tripy;
                this.busy_juz_zpushowane.push(trip.routeId);
            });
        } else console.log("Cannot find any routes information");
    }
    getRoutes() {
        return fetch(
            "https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/22313c56-5acf-41c7-a5fd-dc5dc72b3851/download/routes.json"
        )
            .then((res) => res.json())
            .then((body) => {
                this.setRoutes(body);
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
                this.routes_ids[route.routeId] = route.routeId;
                this.routes_with_id[route.routeShortName] = route.routeId;
                this.routes_with_names[route.routeShortName] = route.routeShortName;
                namesToRoutes[route.routeShortName] = route.routeId;
            });
        } else console.log("Cannot find any routes information");
    }
    showRoutes() {
        for (var linia_autobusu in this.routes_with_names) {
            if (this.routes_with_names.hasOwnProperty(linia_autobusu)) {
                var element = {};
                var trasy = [];
                element.linia = linia_autobusu;
                for (var i=0; i < routes_with_trips[this.routes_with_id[linia_autobusu]].length; i++) {
                    let tripId = createTripId(routes_with_trips[this.routes_with_id[linia_autobusu]][i], this.routes_with_id[linia_autobusu]);
                    let kierunek = this.trips[tripId];
                    if(kierunek.indexOf("+") > -1){
                        kierunek = stripKierunek(kierunek);
                        trasy.push(kierunek);
                    }
                    else if (kierunek.indexOf("(") > -1){
                        trasy.push(kierunek);
                    }
                }
                element.kierunki = trasy;
                if (element.kierunki.length > 0){
                    rozkladData.push(element);
                }
            }
        }
    }
}

export const busesService = new BusService();
busesService.getRoutes();
busesService.getTrips();
busesService.getStops();

function RozkladJazdy() {
    const [{ bus, kierunek, przystanek }, setData] = useState({
        bus: "---Wybierz numer linii---",
        kierunek: " ",
        przystanek: "---Wybierz przystanek---"
    });

    const busy = rozkladData.map((bus) => (
        <option key={bus.linia} value={bus.linia}>
            {bus.linia}
        </option>
    ));

    const kierunki = rozkladData.find(item => item.linia === bus)?.kierunki.map((kierunek) => (
        <option key={kierunek} value={kierunek}>
            {kierunek}
        </option>
    ));

    const przystanki = rozkladData2.find(item => item.kierunek === kierunek)?.przystanek.map((przystanek) => (
        <option key={przystanek} value={przystanek}>
            {przystanek}
        </option>
    ));

    function handleLiniaChange(event) {
        setData(data => ({ kierunek: '', bus: event.target.value }));
    }
    function handleKierunekChange(event) {
        setData(data => ({ ...data, kierunek: event.target.value }));
    }
    function handlePrzystanekChange(event) {
        setData(data => ({ ...data, przystanek: event.target.value }));
    }
    function showRozklad(){
        document.getElementById("RozkladInfo").innerHTML = "";
        let linia = document.getElementById('linia').value;
        let kierunek = document.getElementById('kierunek').value;
        let przystanek = document.getElementById('przystanek').value;
        if (typeof przystanek == 'undefined') {
            return;
        }
        let godziny;
        for (let i = 0; i<stopsWithNames[przystanek].length; i++ ) {
            let rozkladID = (createTripId(namesToTrips[kierunek+namesToRoutes[linia]], namesToRoutes[linia])+stopsWithNames[przystanek][i]);
            godziny = przystanekGodziny.filter(x => x.przystanek === rozkladID).map(x => x.godziny);
            if(godziny.length > 0) {
                break;
            }
        }
        let godzina = godziny[0];
        let rozkladGodzin = [];
        for (let k = 0; k <=24; k++){
            var element = {};
            for (let i = 0; i <godzina.length; i++) {
                let godzinka = godzina[i].substr(11,2);
                if (godzinka == k) {
                    element.indeks = godzinka;
                    let tablicaGodzin = [];
                    for (let j = 0; j <godzina.length; j++) {
                        if (godzina[j].substr(11,2) === godzinka) {
                            tablicaGodzin.push(godzina[j].substr(14,2));
                        }
                    }
                    element.godziny = tablicaGodzin;
                }
            }
            rozkladGodzin.push(element)
        }
        for (var i=0; i<rozkladGodzin.length; i++) {
            if (rozkladGodzin[i].indeks > 0){
                let sortedHours = rozkladGodzin[i].godziny;
                sortedHours.sort();
                document.getElementById("RozkladInfo").innerHTML += "<table class='rozklad border-separate border border-gray-900 bg-black text-yellow-500 font-bold text-lg'><td><td>" + rozkladGodzin[i].indeks + ":" + "</td><td class='text-right'>" + sortedHours + "</td></td><br>";
            }
        }
    }
    return (
        <main className='grid place-items-center'>
            <div className="text-yellow-50 font-extrabold text-lg" id="Clock">
                01:57
            </div>
            <div>
                <form id="StopSelectionForm" onSubmit={() => console.log("Submitted")}>
                    <select name="Bus" id="linia"
                            className="js-example-basic-single h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline"
                            value={bus} onClick={handleLiniaChange} onChange={handleLiniaChange}>
                        {busy}
                    </select>
                    <select name="Kierunek" id="kierunek"
                            className="js-example-basic-single h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline"
                            value={kierunek} onChange={handleKierunekChange}>
                        {kierunki}
                    </select>
                    <select name="Przystanek" id="przystanek"
                            className="js-example-basic-single h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline"
                            value={przystanek} onClick={handlePrzystanekChange} onChange={handlePrzystanekChange}>
                        {przystanki}
                    </select>
                    <button type="button" className="ml-5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded" onClick={showRozklad}>
                        Pokaż rozkład jazdy!
                    </button>
                </form>
            </div>
            <div id="RozkladInfo">

            </div>
        </main>
    );
}

export default RozkladJazdy;
