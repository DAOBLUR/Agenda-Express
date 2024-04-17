const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const bp = require('body-parser')
const { get } = require('http');
const app = express();

app.use(cors());
app.use(express.static('pub'))
app.use(bp.json());
app.use(
    bp.urlencoded(
        {
            extended: true
        }
    )
);


const PORT = '1000';
const SERVER_PATH = `http://localhost:${PORT}/`;

app.listen(PORT, () => {
    console.log(`Listening in: ${SERVER_PATH}`)
});

app.get('/', (request, response) => {
    response.sendFile(path.resolve(__dirname, 'index.html'))
});


const AGENDA_PATH = 'priv/agenda/';
const API_KEY = '7qw89er74ty5u61io23p0a';

function VerifyAPIKey(req, res, next) {
    const api_Key = req.get('API-KEY');

    if (api_Key && api_Key === API_KEY) 
    {
        next();
    } 
    else 
    {
        res.status(403).json({ error: 'Access Denied: Invalid API Key.' });
    }
}

app.use(VerifyAPIKey);

app.get('/GetAllEvents', (request, response) => {
    let Agenda = [];
    const getAgenda = fs.readdirSync('priv/agenda/');

    getAgenda.forEach(day => {
        const getEvents = fs.readdirSync(`${AGENDA_PATH}${day}`);
        let Events = [];
        
        if(getEvents.length > 0)
        {
            getEvents.forEach(event => {
                const content = fs.readFileSync(`${AGENDA_PATH}${day}/${event}`).toString().split('\n');
                
                const title = content[0];
                const description = content.slice(1).join('<br>');

                Events.push({ date: day, hour: event.split('.')[0].replace('-', ':'), title, description });
            });
            Agenda.push({ date: day, events: Events });
        }
    });

    response.json(Agenda);
});

app.post('/Create', (request, response) => {
    console.log(request.body);
    const { title, date, hour, description } = request.body;

    if(!date || date === "") return response.json('Error in DATE');
    if(!hour || hour === "") return response.json('Error in HOUR');
    
    const eventPath = `${AGENDA_PATH}${date}/${hour.replace(':', '-')}.txt`;

    if (fs.existsSync(eventPath)) {
        return response.status(400).json('Event already exists.');
    }

    if (!fs.existsSync(`${AGENDA_PATH}${date}`)){
        fs.mkdirSync(`${AGENDA_PATH}${date}`, { recursive: true });
    }

    fs.writeFileSync(eventPath, `${title}\n${description}`);
    response.json('Event created successfully.');
});


app.post('/Delete', (request, response) => {
    console.log(request.body);
    const { date, hour } = request.body;
    const eventPath = `${AGENDA_PATH}${date}/${hour.replace(':', '-')}.txt`;

    if (!fs.existsSync(eventPath)) {
        return response.status(404).send('Event not exists.');
    }

    fs.unlinkSync(eventPath);
    response.json('Event deleted successfully.');
});

app.put('/Update', (request, response) => {
    console.log(request.body);

    const { oldTitle, oldDate, oldHour, oldDescription } = request.body[0];
    const { newTitle, newDate, newHour, newDescription } = request.body[1];
    
    const oldEventPath = `${AGENDA_PATH}${oldDate}/${oldHour.replace(':', '-')}.txt`;
    const newEventPath = `${AGENDA_PATH}${newDate}/${newHour.replace(':', '-')}.txt`;

    if(!oldDate || oldDate === "") return response.json('Error in DATE');
    if(!oldHour || oldHour === "") return response.json('Error in HOUR');

    if(!newDate || newDate === "") return response.json('Error in DATE');
    if(!newHour || newHour === "") return response.json('Error in HOUR');

    if (!fs.existsSync(oldEventPath)){
        return response.status(404).send('Event not exists.');
    }

    if(oldEventPath !== newEventPath)
    {
        if (fs.existsSync(newEventPath)) {
            return response.status(409).json('There is already an event at that HOUR.');
        }
        else
        {
            fs.unlinkSync(oldEventPath);
            fs.writeFileSync(newEventPath, `${newTitle}\n${newDescription}`);
        }
    }
    else
    {
        fs.writeFileSync(oldEventPath, `${newTitle}\n${newDescription}`);
    }
    
    response.json('Event updated successfully.');
});