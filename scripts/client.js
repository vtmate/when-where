//today's date data
var dt = new Date();
var currentDay = dt.getDate();
var month = dt.getMonth() + 1;
var year = dt.getFullYear();
var daysInCurrMonth = new Date(year, month, 0).getDate();

var dayHolder = document.getElementById("dayHolder");
var chosen = [];

//Own button class
class DayButton{
    num;
    dayButton;
    isChosen;
    constructor(num){
        this.isChosen = false;
        this.dayButton = document.createElement('button');
        this.dayButton.innerText = num;
        this.dayButton.classList.add("dayButton");
        this.dayButton.addEventListener('click', () => {
            if(this.isChosen){
                this.isChosen = false;
                this.dayButton.classList.remove("chosen");
                var index = chosen.indexOf(num);
                if(index != -1){
                    chosen.splice(index, 1); //removing it from the chosen array
                }
            } else {
                this.isChosen = true;
                this.dayButton.classList.add("chosen");
                chosen.push(num);                
            }
            console.log(chosen);
        });
    }

    get(){
        return this.dayButton;
    }
}

//changing header's text in mobile view
function onResize() {
    if(window.innerWidth < 698){
        return ["Hé", "Ke", "Sze", "Csü", "Pé", "Szo", "Vas"];
    } else {
        return ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];
    }
}
const days = onResize();

//inserting day names
for(var i = 0; i < 7; i++){
    var b = document.createElement('button');
    b.classList.add("dayOfWeek");
    b.classList.add("unclickable");
    b.innerText = days[i];
    dayHolder.append(b);
}

//blank buttons before today's date
const index = dt.getDay();
for(var i = 0; i < index - 1; i++){
    var blank = document.createElement('button');
    dayHolder.append(blank);
}

//days of current month from today
let counter = 0;
for(var i = currentDay; i <= daysInCurrMonth; i++){
    counter++;
    var b = new DayButton(i);
    dayHolder.append(b.get());
}

//days of next month
for(var i = 1; i <= 30-counter; i++){
    var b = new DayButton(i);
    dayHolder.append(b.get());
}

//blank buttons after the 30 days
var remain = 7 - index - 1;
if(index == 7) remain = 6;
for(var i = 0; i < remain; i++){
    var blank = document.createElement('button');
    dayHolder.append(blank);
}

//________________helping functions for index.html___________________

//creating a random, 3-letter identifier
function generateIdentifier() {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let randomString = '';
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }
    return randomString;
}
//simplifying the name of the event (no spaces, accents)
function simplifyName(name){
    for(var i = 0; i < name.length; i++){
        // if(name.charAt(i) = ' ') 
        name = name.toLowerCase();
        switch(name.charAt(i)){
            case ' ':
                name = name.replace(' ','');
                i--;
                break;
                case 'á':
                    name = name.replace('á','a');
                    i--;
                    break;
                    case 'é':
                        name = name.replace('é','e');
                        i--;
                        break;
                        case 'í':
                    name = name.replace('í','i');
                    i--;
                    break;
                    case 'ó':
                    name = name.replace('ó','o');
                    i--;
                    break;
                    case 'ö':
                        name = name.replace('ö','o');
                        i--;
                        break;
                        case 'ő':
                            name = name.replace('ő','o');
                    i--;
                    break;
                    case 'ú':
                        name = name.replace('ú','u');
                        i--;
                        break;
                        case 'ű':
                            name = name.replace('ű','u');
                    i--;
                    break;
                    case 'ü':
                        name = name.replace('ü','u');
                        i--;
                        break;
                    }
    }
    return name;
}
//creating the link with the two functions above
function createLink(name){
    name = simplifyName(name) + generateIdentifier();
    return name;
}

//______________________index.html___________________________
    //1 retrieving the current counter
    //2 creating the new unique link
    //3 incrementing the counter
    //4 sorting good days
    //5 saving good days to database
    //6 opening response.html with query parameter

const form = document.getElementById('form');

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    if(chosen.length == 0){
        alert('nem választottál ki egyetlen napot sem!');
    } else {
        try {
            // 1. Retrieving the current counter
            const retrieveCounter = await fetch('https://when-and-where.onrender.com/retrieveCounter');
        
            if (retrieveCounter.ok) {
                var counter = await retrieveCounter.json();
                console.log('Retrieve counter ok: ' + counter);
        
                // 2. Creating the new unique link
                const formData = new FormData(form);
                var name = formData.get('eventName');
                const link = createLink(name) + counter;
                console.log('Link: ' + link);
        
                // 3. Incrementing the counter
                const incrementCounter = await fetch('https://when-and-where.onrender.com/incrementCounter', {
                    method: 'POST'
                });
                if (!incrementCounter.ok) {
                    console.error('Error incrementing counter');
                    return;
                }
        
                // 4. Sorting good days
                const curDays = [];
                const nextDays = []; //days in next month
                chosen.forEach(day => {
                    if(day >= currentDay) curDays.push(day);
                    else nextDays.push(day);
                })
                //sorting the two arrays
                curDays.sort(function(a, b){ return a - b});
                nextDays.sort(function(a, b){ return a - b});
                //concatenating them
                chosen = curDays.concat(nextDays);
                console.log('chosen: ' + chosen);
        
        
                // 5. Saving good days to the database
                const datas = {
                    link: link,
                    hours: chosen
                };

                const savingGoodDays = await fetch('https://when-and-where.onrender.com/savingGoodDays', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(datas)
                });
                if (!savingGoodDays.ok) {
                    console.error('Error saving good days');
                    return;
                }

                // 6. Opening response.html with query parameter
                var url = `response.html?message=` + `${link}`;
                window.location.href = url;
            } else {
                console.error('Error retrieving counter');
            }
        } catch (error) {
            console.error('Try-catch error:', error);
        }
    }
});