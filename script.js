import * as firebaseui from 'firebaseui'

$(document).ready(function () {
    loadStates();
});

function loadStates() {
    let statesList = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];
    let x = document.getElementById("stateSelect");

    let timeSelect = ['12:00']
    statesList.forEach(state => {
        let option = document.createElement("option");
        option.value = state;
        option.text = state;
        x.add(option);
    })
}

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("font-weight-bold");
        tablinks[i].classList.remove("active");
        tablinks[i].classList.add("inactive");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("font-weight-bold");
    evt.currentTarget.classList.remove("inactive");
    evt.currentTarget.classList.add("active");
}

async function submitMe() {
    let state = getStateFromForm();
    console.log(state);
    if (state == '' && !document.getElementById('noStateSelected')) {
        $('#stateForm').append(`<div id="noStateSelected" class="text-danger">Please select a state</div>`)
    } else {
        if (document.getElementById('noStateSelected')) {
            document.getElementById('noStateSelected').remove();
        }

        const result = await axios({
            method: 'get',
            url: `https://developer.nps.gov/api/v1/parks?stateCode=${state}&api_key=FC8pCCfcIs52SJLaHDcXdYJICINb6ixQA7b3Oeqx`,
        });

        let json = await result.data.data;
        parseData(json, state);
        
    }
}

function parseData(json, state){
    let mapped = json.map(({description, addresses, fullName})=>({description, addresses, fullName}));
    mapped.forEach(function(item, index, object){
        let filtered = item.addresses.filter(x=>x.stateCode=state);
        item.addresses = filtered;
        if(item.addresses.length ==0){
            object.splice(index, 1);
        }
    });
    renderParsed(mapped);
}

function renderParsed(json){
    json.forEach(obj => {
        let created = createResultElement(obj);
        $('#myResults').append(created);
    })
}

function createResultElement(object){
    return `<div style="background-color:#1b1a28; color:white">
        <span style="color: #FF0D86"> Name: ${object.fullName} </span>
        <br>
        Postal Code: ${object.addresses[0].postalCode}
        <br>
        Description: <span class="w-1">${object.description}</span>
    </div>
    <br>    `
}

function getStateFromForm() {
    let sel = document.getElementById("stateSelect");
    let length = sel.options.length;
    let selectedState;
    for (let i = 0; i < length; i++) {
        if (sel.options[i].selected) {
            selectedState = sel.options[i].value;
            break;
        }
    }
    return selectedState;
}

//LOGIN
// const express = require('express');

// const app = express();

// const bodyParser = require('body-parser');
// app.use(bodyParser.json());

// const expressSession = require('express-session');

// app.use(expressSession({
//     name: "SessionCookie",
//     secret: "express session secret",
//     resave: false,
//     saveUninitialized: false
// }));

// const Secret = require("./Secret.js");

// const login_data = require('data-store')({ path: process.cwd() + '/data/users.json' });

// app.post('/login', (req,res) => {

//     let user = req.body.user;
//     let password = req.body.password;

//     let user_data = login_data.get(user);
//     if (user_data == null) {
//         res.status(404).send("Not found");
//         return;
//     }
//     if (user_data.password == password) {
//         console.log("User " + user + " credentials valid");
//         req.session.user = user;
//         res.json(true);
//         return;
//     }
//     res.status(403).send("Unauthorized");
// });

// app.get('/logout', (req, res) => {
//     delete req.session.user;
//     res.json(true);
// })

// app.get('/secret', (req, res) => {
//     if (req.session.user == undefined) {
//         res.status(403).send("Unauthorized");
//         return;
//     }

//     res.json(Secret.getAllIDsForOwner(req.session.user));
//     return;
// });

// app.get('/secret/:id', (req, res) => {
//     if (req.session.user == undefined) {
//         res.status(403).send("Unauthorized");
//         return;
//     }

//     let s = Secret.findByID(req.params.id);
//     if (s == null) {
//         res.status(404).send("Not found");
//         return;
//     }

//     if (s.owner != req.session.user) {
//         res.status(403).send("Unauthorized");
//         return;
//     }

//     res.json(s);
// } );

// app.post('/secret', (req, res)=> {
//     if (req.session.user == undefined) {
//         res.status(403).send("Unauthorized");
//         return;
//     }

//     let s = Secret.create(req.session.user, req.body.secret);
//     if (s == null) {
//         res.status(400).send("Bad Request");
//         return;
//     }
//     return res.json(s);
// });

// app.put('/secret/:id', (req, res) => {
//     if (req.session.user == undefined) {
//         res.status(403).send("Unauthorized");
//         return;
//     }

//     let s = Secret.findByID(req.params.id);
//     if (s == null) {
//         res.status(404).send("Not found");
//         return;
//     }
//     if (s.owner != req.session.user) {
//         res.status(403).send("Unauthorized");
//         return;
//     }
//     s.update(req.body.secret);

//     res.json(s.id);
// });

// app.delete('/secret/:id', (req, res) => {
//     if (req.session.user == undefined) {
//         res.status(403).send("Unauthorized");
//         return;
//     }

//     let s = Secret.findByID(req.params.id);
//     if (s == null) {
//         res.status(404).send("Not found");
//         return;
//     }

//     if (s.owner != req.session.user) {
//         res.status(403).send("Unauthorized");
//         return;
//     }

//     s.delete();
//     res.json(true);
// })

// const port = 3030;
// app.listen(port, () => {
//     console.log("User Login Example up and running on port " + port);
// });
