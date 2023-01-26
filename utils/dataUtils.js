import {routesService, timetablesService} from "../app.js";

export function getNearestDate(array) {
  return array.sort((a, b) => new Date(a) - new Date(b));
}
export function batchTimetables(arrayOfTimetableIds){
  let batchedTimetable=[];
  arrayOfTimetableIds.forEach(x=>{
    if(timetablesService.timetable.hasOwnProperty(x))
    batchedTimetable=[...batchedTimetable,...insertRouteIdIntoTimetable(timetablesService.timetable[x].delay)]
  })
  return batchedTimetable;
}
export function insertRouteIdIntoTimetable(timetable){
  timetable.forEach(x=>{
  x["busId"] = routesService.routes[x.routeId]
  })
  return timetable
}