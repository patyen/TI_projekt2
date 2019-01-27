///////////////////////LOCAL OPERATIONS//////////////////

window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
document.addEventListener('DOMContentLoaded', onLoad);


let onlineButton = "<br><button onclick='sendDataFromLocalToServer()'>Wyślij dane z lokalnej bazy na serwer</button>";

window.addEventListener('online', function(){
    lfr = document.getElementById('localFetchResult');
    if (lfr)
    {
        lfr.innerHTML += onlineButton;
        fetchDataFromLocal();
    }
});

window.addEventListener('offline', function(){
    lfr = document.getElementById('localFetchResult');
    if (lfr)
    {
        fetchDataFromLocal();
    }
});



let dbName = "SSDB";


if (!window.indexedDB) {
    window.alert("Przeglądarka nie wspiera lokalnej bazy danych.");
}

var request = indexedDB.open(dbName, 4);

request.onerror = function(event) {
    alert('Nie udało się połączyć z lokalną bazą');
    return false;
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log("scuccess" + db);
};

request.onupgradeneeded = function(event) {
    var db = event.target.result;
    db.createObjectStore("zdarzenia", {autoIncrement: true});
}








function sendDataToLocal()
{
    let form = document.getElementById('form');

    let z = {
        nazwa_zdarzenia: form.name.value,
        data_zdarzenia: form.date.value,
    };
    
    var request = db.transaction(["zdarzenia"], "readwrite")
        .objectStore("zdarzenia")
        .add(z);

    request.onerror = function(event)
    {
        alert("NIE UDALO SIE DODAC");
    }

    request.onsuccess = function(event)
    {
        alert("UDALO SIE DODAC");
    }
    // let objectStore = transaction.objectStore("zdarzenia");

}

let toRender = "<table><tr><th>Wydarzenie</th><th>Data</th><th>Użytkownik</th></tr>";


function fetchDataFromLocal()
{
    var objectStore = db.transaction(["zdarzenia"]).objectStore("zdarzenia");
    let result = document.getElementById('result');

    objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        
        if (cursor)
        {
            toRender += "<div id='localFetchResult'><tr><td>" + cursor.value.nazwa_zdarzenia + "</td><td>" + cursor.value.data_zdarzenia + "</td><td>" + "COS" + "</td></tr>";
            cursor.continue();
        }
        else
        {
            toRender += "</table>"
            if (navigator.onLine)
                toRender += onlineButton;
            toRender += "</div>";
            result.innerHTML = toRender;
            toRender = "<table><tr><th>Wydarzenie</th><th>Data</th><th>Użytkownik</th></tr>";
        }


    }
}












///////////////// SERVER OPERATIONS //////////////////////

function fetchDataFromServer()
{


    let result = document.getElementById('result');

    fetch("Server.php")
        .then(response => response.json())
        .then(data => {
            let toRender = "<table><tr><th>Wydarzenie</th><th>Data</th><th>Użytkownik</th></tr>";
            for (let i = 0; i < data.length; ++i)
            {
                toRender += "<tr><td>" + data[i].nazwa_zdarzenia + "</td><td>" + data[i].data_zdarzenia + "</td><td>" + data[i].nazwa_uzytkownika + "</td></tr>";

            }
            console.log(data);

            toRender += "</table>";

            result.innerHTML = toRender;
        });
    
}



function sendDataToServer()
{

    if (!validate())
        return false;

    let form = document.getElementById('form');
    let data = new FormData();
    data.append("name", form.name.value);
    data.append("date", form.date.value);

    fetch('Server.php', {
        method: "POST",
        body: data
    })
    .then(response => {
        
        if (response.ok)
        {
            fetchDataFromServer();
        }

        form.name.value = "";

        return response.text();
    })
    .then(body => {
        console.log(body);
    });
}






function validate()
{
    let form = document.getElementById("form");
    let message = "";
    let valid = true;

    if (form.name.value.length == 0)
    {
        valid = false;
        message += "Nazwa jest wymagana.<br>";
    }
    if (form.date.value.length == 0)
    {
        valid = false;
        message += "Data jest wymagana."
    }

    document.getElementById('message').innerHTML = message;
    document.getElementById('message').style.color = 'red';

    if (!valid)
        return false;

    document.getElementById('message').innerHTML = "";    
    return true;
}




function onLoad()
{


    // request = indexedDB.open(dbName, 3);




    // var db = indexedDB.open(dbName, 1, function(upgradeDb) {
    //     if (!upgradeDb.objectStoreNames.contains('zdarzenia')) {
    //         var mydb = upgradeDb.createObjectStore('zdarzenia');
    //     }
    // });

    

}