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
    json.forEach(obj => {
        let created = createResultElement(obj);
        $('#myResults').append(created);
    })
}

function removeFavorite(event) {
    
    let orig = event.currentTarget.parentElement.parentElement;
    let park =$(orig).find('#parkName')[0].innerHTML; /*need code here to remove favorite from backend using variable park*/
    console.log("removing "+park);
    orig.remove();

}

function addFavorite(event) {
    let orig = event.currentTarget.parentElement.parentElement;
    let park = $(orig).find('#parkName')[0].innerHTML;
    let savedList = $('#mySaved').find('#parkName');
    let doesNotExist = true;
    for (let i = 0; i < savedList.length; i++) {
        if (savedList[i].innerHTML == park) {
            doesNotExist = false;
        }
    }
    console.log(doesNotExist);

    if (doesNotExist) {
        let clone = orig.cloneNode([true]);
        let newobj = clone.outerHTML.replace(`<button class="btn btn-info small" onclick="addFavorite(event)">Add to my favorites!</button>`, '<button class="btn btn-danger small" onclick="removeFavorite(event)">Remove from my favorites</button>');
        newobj = newobj + `<br>`
        /*need code here to send obj to backend storage using variable park*/
        $('#mySaved').append(newobj);
    } else {
        alert("This park is already saved!");
    }
}

function createResultElement(object) {
    return `<div id="${object.addresses[0].postalCode}" style="background-color:#1b1a28; color:white">
        <span style="color: #FF0D86"> Name: <span id="parkName">${object.fullName}</span> &nbsp; &nbsp; <button class="btn btn-info small" onclick="addFavorite(event)">Add to my favorites!</button></span>
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