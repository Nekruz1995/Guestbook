const http = require('http');
const fs = require('fs');
const util = require('util');
const qs = require('querystring');
const validator = require('validator');
const port = 6267;
const pageTemplate = fs.readFileSync('index.html.template', 'utf-8');

let guestbookEntries = [];
try {
	guestbookEntries = JSON.parse(fs.readFileSync('db.json', 'utf-8'));
} catch(e) {
	console.error(e);
}

function addEntry(postData) {
	const entry = {'name': postData.name,'message': postData.message};
	guestbookEntries.push(entry);
	fs.writeFileSync('db.json', JSON.stringify(guestbookEntries));
}

function renderPage() {
	let entries = '';
	for(message of guestbookEntries){
    		entries += `<p>${validator.escape(message.name)}</p>` + `<p>${validator.escape(message.message)}</p>`;
	}
	const page = util.format(pageTemplate, entries);
	return page;
}
function send(response, data) {
	response.writeHead(200, {'Content-Type' : 'text/html'});
	response.write(data);
	response.end();
}
function redirect(response, location){
	response.writeHead(302, {'Location': location});
	response.end();
}
const server = http.createServer((request, response) => {
	if(request.method == 'POST') {
		let body = '';
		request.setEncoding('utf-8');
		request.on('data', (chunk) => {
			body += chunk;
		});
		request.on('end', () => {
			const postData = qs.parse(body);
			addEntry(postData);
			redirect(response, '/');
		});
	}
	else if(request.method == 'GET') {
		const page = renderPage();
		send(response, page);
	}
});
server.listen(port, () => {console.log("The server is listening on port " + port);});
