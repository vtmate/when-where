// Retrieve the query parameter
var params = new URLSearchParams(window.location.search);
var message = params.get('message');
link = 'https://when-and-where.onrender.com/respond/' + message;

// Update the paragraph text
document.getElementById('customLink').innerText = link;

const visit = document.getElementById('visit');
const createMore = document.getElementById('create-more');
const copy = document.getElementById('copy');

//visiting link
visit.addEventListener('click',() => {
    window.location.href = link;
});

//going back to original page
createMore.addEventListener('click', () => {
    window.history.back();
});

//copying link to clipboard
copy.addEventListener('click', () => {
    navigator.clipboard.writeText(link);
});