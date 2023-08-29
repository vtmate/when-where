// Retrieve the query parameter
var params = new URLSearchParams(window.location.search);
var message = params.get('message');

const backButton = document.getElementById('back');
const forwardButton = document.getElementById('result');

//going back to change the chosen dates
backButton.addEventListener('click', () => {
    window.history.back();
});

//visit results
forwardButton.addEventListener('click',() => {
    window.location.href = message;
});