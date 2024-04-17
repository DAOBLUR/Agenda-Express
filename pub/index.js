//const PORT = '3000';
const PORT = '8888';

const SERVER_PATH = `http://localhost:${PORT}/`;
const API_KEY = '7qw89er74ty5u61io23p0a';

var Agenda = [];
var CurrentEditEventId = 0;

document.getElementById('form').addEventListener('submit', Create);

function VerifyFormData() 
{
    const title = document.getElementById('formTitle').value;
    const date = document.getElementById('formDate').value;
    const hour = document.getElementById('formHour').value;
    const description = document.getElementById('formDescription').value;

    console.log("data", title);
    console.log("data", date );
    console.log("data", hour);
    console.log("data", description);

    if(!title || title === "")
    {
        console.log("Empty Title");
        return false;
    }
    else if(!date || date === "")
    {
        console.log("Empty Date");
        return false;
    }
    else if(!hour || hour === "")
    {
        console.log("Empty Hour");
        return false;
    }
    else if(!description || description === "")
    {
        console.log("Empty Description");
        return false;
    }
    else
    {
        return true;
    }
}

function CleanForm()
{
    document.getElementById('formTitle').value = "";
    document.getElementById('formDate').value = "";
    document.getElementById('formHour').value = "";
    document.getElementById('formDescription').value = "";
}

function GetAllAgenda() 
{
    Agenda = [];
    let count = 0;
    const url = `${SERVER_PATH}GetAllEvents`;
    fetch(url, {
        method: 'GET',
        headers: {
            'API-KEY': API_KEY
        }
    }).then(
        response => response.json()
    ).then(
        data => {
            let content = '';
            for(let i in data)
            {
                let dayContent = data[i];
                let events = "";
                for(let j in dayContent.events)
                {
                    let event = dayContent.events[j];
                    Agenda.push(event);
                    events += 
                        '<div class="event" id="' + `event-${count}` + '">'+
                            '<h3>' +
                                event.title +
                            '</h3>' +

                            '<p><b>Date: </b>' +
                                event.date +
                            '</p>' +
                            '<p><b>Hour: </b>' +
                                event.hour +
                            '</p>' +
                            '<p><b>Description: </b>' +
                                event.description +
                            '</p>' +

                            '<div class="buttons">'  +
                                '<button class="update" onclick="LoadDataToUpdate(' + `'${count}'` + ')">Edit</button>' +
                                '<button class="delete" onclick="Delete(' + `'${count}'` + ')">Delete</button>' +
                            '</div>' +
                        '</div>';
                    
                    count++;
                }
                
                content += 
                    '<div class="dayContent">'+
                        '<h2>' +
                            dayContent.date +
                        '</h2>' +
                        events +
                    '</div>';
            }

            document.querySelector("#allEvents").innerHTML = content;
            //console.log(Agenda);
        }
    )
    .catch(
        (error) => {
            console.error('Error:', error);
        }
    );
}
        
function Create()
{
    console.log('CREATE');

    const title = document.getElementById('formTitle').value;
    const date = document.getElementById('formDate').value;
    const hour = document.getElementById('formHour').value;
    const description = document.getElementById('formDescription').value;

    if(!VerifyFormData())
    {
        return;
    }

    fetch(`${SERVER_PATH}Create`, {
        method: 'POST',
        headers: 
        {
            'API-KEY': API_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            title: title,
            date: date,
            hour: hour,
            description: description,
        }),
    })
    .then(
        response => response.json()
    )
    .then(
        data => {
            CleanForm();

            GetAllAgenda();
        }
    )
    .catch(
        (error) => {
            console.error('Error:', error);
        }
    );
}

function Delete(date, hour)
{
    //event.preventDefault();
    console.log('DELETE');
    const date2 = Agenda.find((event) => event.hour === hour).date;
    const title = Agenda.find((event) => event.hour === hour).title;
    console.log('title',title);

    console.log(hour, date, date2);
    fetch(`${SERVER_PATH}Delete`, {
        method: 'POST',
        headers: {
            'API-KEY': API_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            date: date,
            hour: hour,
        }),
    })
    .then(
        response => response.json()
    )
    .then(
        data => {
            console.log(data);
            //Events = Events.filter(event => event.hour !== hour);
            GetAllAgenda();
        }
    )
    .catch(
        (error) => {
            console.error('Error:', error);
        }
    );
}

function LoadDataToUpdate(index) {
    console.log('Update...')
    const event = Agenda[index];
    CurrentEditEventId = index;

    document.getElementById("form").scrollIntoView({behavior: "smooth", block: "center"});

    document.getElementById('formTitle').value = event.title;
    document.getElementById('formDate').value = event.date;
    document.getElementById('formHour').value = event.hour;
    document.getElementById('formDescription').value = event.description;

    document.getElementById("createBtn").toggleAttribute("hidden");
    document.getElementById("updateBtn").toggleAttribute("hidden");
    document.getElementById("cancelBtn").toggleAttribute("hidden");
}

function Update()
{
    console.log('UPDATE');

    const title = document.getElementById('formTitle').value;
    const date = document.getElementById('formDate').value;
    const hour = document.getElementById('formHour').value;
    const description = document.getElementById('formDescription').value;

    if(!VerifyFormData())
    {
        return;
    }

    const Event = Agenda[CurrentEditEventId];

    fetch(`${SERVER_PATH}Update`, {
        method: 'PUT',
        headers: {
            'API-KEY': API_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify([
            { 
                oldTitle: Event.title,
                oldDate: Event.date,
                oldHour: Event.hour,
                oldDescription: Event.description,
            },
            { 
                newTitle: title,
                newDate: date,
                newHour: hour,
                newDescription: description,
            }
        ]),
    })
    .then(
        response => response.json()
    )
    .then(
        data => {
            console.log(data);
            GetAllAgenda();
        }
    )
    .catch(
        (error) => {
            console.error('Error:', error);
        }
    );
}

function CancelUpdate()
{
    document.getElementById('formTitle').value = '';
    document.getElementById('formDate').value = '';
    document.getElementById('formHour').value = '';
    document.getElementById('formDescription').value = '';

    document.getElementById("createBtn").toggleAttribute("hidden");
    document.getElementById("updateBtn").toggleAttribute("hidden");
    document.getElementById("cancelBtn").toggleAttribute("hidden");

    document.getElementById("event-" + CurrentEditEventId).scrollIntoView({behavior: "smooth", block: "center"});
}

GetAllAgenda();

