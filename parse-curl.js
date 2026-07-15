const fs = require('fs');
const data = require('./curl-output.json');
console.log(Object.keys(data));
if (data.data) console.log("Keys in data:", Object.keys(data.data));
if (data.page) console.log("Keys in page:", Object.keys(data.page));
