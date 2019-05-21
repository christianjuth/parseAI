let fs = require('fs');

let processCount;
let finishes = 0;
let finish = () => {
	finishes++;

	let percent = parseInt(finishes*100/processCount) + '% ';
	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	process.stdout.write(percent);
	
	if(finishes >= processCount){
		process.stdout.write("\n");
	}
};

fs.readdir('./features', (err, files) => {

	files = files.filter(file => /\.json$/.test(file));
	processCount = files.length;

	let adjustments = {
		max: {},
		min: {},
		library: {}
	}

	files.forEach(file => {
		let data = require('../features/'+file);

		data.html.forEach(div => {
			Object.keys(div).forEach(key => {
				let value = div[key];
				if(typeof value == 'number'){
					if(value > adjustments.max[key] || !adjustments.max[key]) adjustments.max[key] = value;
					if(value < adjustments.min[key] || !adjustments.min[key]) adjustments.min[key] = value;
				} 
				else if(typeof value == 'string'){
					if(!adjustments.library[key]) adjustments.library[key] = [];
					if(!adjustments.library[key].includes(value)) adjustments.library[key].push(value);
				}
			});
		});

	});

	let output = [];

	let adjust = (div, adjustments) => {
		Object.keys(div).forEach(key => {
			let value = div[key];
			if(typeof value == 'number'){
				if(adjustments.min[key] < 0)
					div[key] = (value-adjustments.min[key])/(adjustments.max[key]-adjustments.min[key]);
				else
					div[key] = value/adjustments.max[key];
			} 
			else if(typeof value == 'boolean'){
				div[key] = value ? 1 : 0;
			}
			else if(key != 'type'){
				div[key] = adjustments.library[key].indexOf(value)/(adjustments.library[key].length-1);
			}
		});

		return div;
	}

	files.forEach(file => {
		let data = require('../features/'+file);

		data.html = data.html.map(div => {
			return adjust(div, adjustments);
		});

		output = output.concat(data.html);
	});

	fs.writeFileSync('./trainData.json', JSON.stringify(output, null, 2), (err) => {
		if(err) console.log(err);
	});

	fs.writeFileSync('./adjustments.json', JSON.stringify(adjustments, null, 2), (err) => {
		if(err) console.log(err);
	});
});