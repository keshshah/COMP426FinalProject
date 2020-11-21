$(document).ready(function () {
    loadStates();
});


let conditionList =[];
let stateList = [];
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

//Search Code with Debounce and Autocomplete

document.addEventListener('DOMContentLoaded', init);

async function searchParks(text) {
    var searchTerm = text.toString();
    const result = await axios ({
        method: 'get',
        url: `https://developer.nps.gov/api/v1/parks?q=${searchTerm}&api_key=FC8pCCfcIs52SJLaHDcXdYJICINb6ixQA7b3Oeqx`,
    });
    var json = await result.data.data;
    parseDataSearch(json);
}

function init() {
    //adds event listener to keystrokes in the search bar
    document.getElementById('searchByName').addEventListener('input', callDebounce);
}

var debouncer = function (func, wait, immediate) {
    var timeOut;
    return function() {
        var context = this, args = arguments;
        var afterWait = function() {
            timeOut = null;
            if (!immediate) func.apply(context, args);
        };
        var callImmediate = immediate && !timeOut;
        clearTimeout(timeOut);
        timeOut = setTimeout(afterWait, wait);
        if (callImmediate) func.apply(context, args);
    };
};

//search results are called and displayed at most once every 300 ms
var callDebounce = debouncer(function(event) {
    let text = event.target.value;
    searchParks(text);
}, 300);

function parseDataSearch(json) {
    let mapped = json.map(({ description, addresses, fullName }) => ({ description, addresses, fullName }));
    mapped.forEach(function (item, index, object) {
        if (item.addresses.length == 0) {
            object.splice(index, 1);
        }
    });
    renderParsed(mapped);
}
//End Of Search Code

function parseData(json, state) {
    let mapped = json.map(({ description, addresses, fullName }) => ({ description, addresses, fullName }));
    mapped.forEach(function (item, index, object) {
        let filtered = item.addresses.filter(x => x.stateCode = state);
        item.addresses = filtered;
        if (item.addresses.length == 0) {
            object.splice(index, 1);
        }
    });
    renderParsed(mapped);
}

function renderParsed(json) {
    $('#myResults').empty();
    conditionList = [];
    let filters = `<table style="width:100%">
    <tbody style="width:100%">
        <tr style="width:100%">
            <td style="width:50%; color: #afff14; font-size:32px; font-weight:bolder">Results Found:</td>
            <td style="width:50%; color: #04ECF0; font-size:20px; font-weight:bold; vertical-align: middle;">
                <div class="form-check form-check-inline" id="filterBoxes">
                    Weather Filters: &nbsp;
                    
                </div>
            </td>
        </tr>
    </tbody>
</table>`;
    $('#myResults').append(filters);
    json.forEach(obj => {
        let created = createResultElement(obj);
        let newEl = document.createElement("div");
        newEl.innerHTML = created.trim();
        let zip = newEl.childNodes[0].id.slice(0,5);
        getWeather(zip, newEl);
        // let conditions = $(newEl).find('#conditions')[0];
        // conditions.classList.add(condition);
        // $('#myResults').append(newEl);
    })
}

function appendFilter1(state){
    let filter = `<input class="form-check-input" type="checkbox" id="defaultCheck${state}" onclick="filterMe(event)" checked>
    <label class="form-check-label" for="defaultCheck${state}">
      ${state}&nbsp;&nbsp;&nbsp;
    </label>`

    $('#filterBoxes1').append(filter);
}

function appendFilter(condition){
    let filter = `<input class="form-check-input" type="checkbox" id="defaultCheck${condition}" onclick="filterMe(event)" checked>
    <label class="form-check-label" for="defaultCheck${condition}">
      ${condition}&nbsp;&nbsp;&nbsp;
    </label>`

    $('#filterBoxes').append(filter);
}

function filterMe(event){
    let id = event.currentTarget.id;
    let length = id.length;
    let condition = id.slice(12, length);
    let list = document.getElementsByClassName(condition);
    let listLength = list.length;
    for(let i = 0 ; i<listLength;i++){
        let container = (list[i].parentElement.parentElement);
        if(container.classList.contains(`hide${condition}`)){
            container.classList.remove(`hide${condition}`);
            container.style.display = "block";  
        } else{
            container.classList.add(`hide${condition}`);
            container.style.display = "none";
        }
    }
}

async function getWeather(zip, element){
    const result = await axios({
        method: 'get',
        url: `https://api.openweathermap.org/data/2.5/weather?zip=${zip}&appid=29386abb2e4b3034cad88437464bb80d`,
    });
    let condition = await result.data.weather[0].main;
    let conditions = $(element).find('#conditions')[0];
        if(!conditionList.includes(condition)){
            conditionList.push(condition);
            appendFilter(condition);
        }
    conditions.classList.add(condition);
    $('#myResults').append(element);
}

function removeFavorite(event) {
    
    let orig = event.currentTarget.parentElement.parentElement;
    let removedState = $(orig).find(`#parkState`)[0].classList[0];
    let park =$(orig).find('#parkName')[0].innerHTML; /*need code here to remove favorite from backend using variable park*/
    orig.parentElement.remove();

    let savedList = document.getElementById('mySaved').childNodes;
    let savedListLength = savedList.length;
    let noStatesLeft = true;
    for(let i=3; i<savedListLength;i++){
        let element = savedList[i];
        let thisState = $(element).find(`#parkState`)[0].classList[0];
        if(thisState == removedState){
            noStatesLeft = false;
        }
    }

    if(noStatesLeft){
        let removeSecond = $('#mySaved').find(`#defaultCheck${removedState}`);
        let removeChilds = removeSecond.parent()[0].childNodes;
        let removeLength = removeChilds.length;
        let indexRemove;
        for(let i = 0; i<removeLength;i++){
            if(removeChilds[i].id == `defaultCheck${removedState}`){
                indexRemove = Array.prototype.indexOf.call(removeChilds, removeChilds[i]);
            }
        }
        removeChilds[indexRemove+2].remove();
        removeChilds[indexRemove].remove();

        // removeSecond.parent()[0].remove();
        let ind = stateList.indexOf(removedState);
        stateList.splice(ind, 1);
        // removeSecond.nextElementSibling.remove();
        // removeSecond.remove();
    }
}

function addFavorite(event) {
    let orig = event.currentTarget.parentElement.parentElement;
    let state = $(orig).find(`#parkState`)[0].classList[0];
    if(!stateList.includes(state)){
        stateList.push(state);
        appendFilter1(state);
    }

    let park = $(orig).find('#parkName')[0].innerHTML;
    let savedList = $('#mySaved').find('#parkName');
    let doesNotExist = true;
    for (let i = 0; i < savedList.length; i++) {
        if (savedList[i].innerHTML == park) {
            doesNotExist = false;
        }
    }

    if (doesNotExist) {
        
        let clone = orig.cloneNode([true]);
        let newobj = clone.outerHTML.replace(`<button class="btn btn-info small" onclick="addFavorite(event)">Add to my favorites!</button>`, '<button class="btn btn-danger small" onclick="removeFavorite(event)">Remove from my favorites</button>');
        newobj = newobj + `<br>`
        /*need code here to send obj to backend storage using variable park*/
        let newEl = document.createElement("div");
        newEl.innerHTML = newobj.trim();
        $(newEl).find('#conditions')[0].remove();
        $('#mySaved').append(newEl);
        let targ = event.currentTarget.parentElement;
        $(targ).append(`<span id="added" style="color:red; font-weight:bolder">&nbsp;&nbsp;&nbsp;Added!</span>`);
        setTimeout(function(){
            $(targ).find('#added')[0].remove();
        }, 3000);
    } else {
        alert("This park is already saved!");
    }
}

function createResultElement(object) {
    return `<div id="${object.addresses[0].postalCode}" style="background-color:#1b1a28; color:white">
        <span id="conditions" class=""></span> <span id="parkState" class="${object.addresses[0].stateCode}"></span>
        <span style="color: #FF0D86"> Name: <span id="parkName">${object.fullName}</span> &nbsp; &nbsp; <button class="btn btn-info small" onclick="addFavorite(event)">Add to my favorites!</button></span>
        <br>
        <span style="color: #FFDF00">Address: ${object.addresses[0].line1}, ${object.addresses[0].city}, ${object.addresses[0].stateCode} ${object.addresses[0].postalCode}</span>
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

$(".checkbox-menu").on("change", "input[type='checkbox']", function() {
    $(this).closest("li").toggleClass("active", this.checked);
 });

 $(document).on('click', '.allow-focus', function (e) {
    e.stopPropagation();
  });
