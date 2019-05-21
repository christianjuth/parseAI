let fs = require('fs'),
	brain = require('brain.js'),
	data = require('../trainData.json');


var net = new brain.NeuralNetwork({
  hiddenLayers: [10,20]
});


let i = 0;
data = data
.filter(obj => {
	if(obj.type == 'other')
		i++;
	return obj.type != 'other' || i <= 2000;
})
.map(obj => {
	let output = {};
	output[obj.type] = 1;
	delete obj.type;
	return {
		input: obj,
		output: output
	};
});


net.train(data);

// net.fromJSON(require('./model.json'));

fs.writeFileSync('model.json', JSON.stringify(net.toJSON(), null, 2));