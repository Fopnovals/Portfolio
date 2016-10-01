timeend= new Date(2016, 10-1, 3);
function time() {
    today = new Date();
    today = Math.floor((timeend-today)/1000);
    tsec=today%60; today=Math.floor(today/60); if(tsec<10)tsec='0'+tsec;
    tmin=today%60; today=Math.floor(today/60); if(tmin<10)tmin='0'+tmin;
    thour=today; today=Math.floor(today/24);
    timestr=thour+"."+tmin+"."+tsec+"";
    var hours = document.getElementsByClassName('hours')[0];
    var minutes = document.getElementsByClassName('minutes')[0];
    var seconds = document.getElementsByClassName('seconds')[0];
    hours.innerHTML = thour;
    minutes.innerHTML = tmin;
    seconds.innerHTML = tsec;
    if(thour == 0 && tmin == 0 && tsec == 0) {
        return;
    }
    window.setTimeout("time()",1000);
}
$(document).ready(function(){
    $('#qrcode').qrcode("1BitmixerEiyyp3eTLaCpgBbhYERs48qza");
});