let fs = require('fs'),
	jsdom = require("jsdom");
let { JSDOM } = jsdom;



fs.readdir('./data', (err, files) => {
	files
	.filter(file => /\.json$/.test(file))
	.forEach(file => {
		setTimeout(() => {
			let data = require('./data/'+file);
			console.log(file);
			data.html = makeDom(data.html);
			fs.writeFileSync('./features/'+file, JSON.stringify(data, null, 2), (err) => {
				if(err) console.log(err);
			}); 
		},10);
	});
});



let divFeatures = (window, div) => {

	let doc = window.document;

	let getPos = (el) => {
	    var rect = el.getBoundingClientRect(),
	    scrollLeft = window.pageXOffset || doc.documentElement.scrollLeft,
	    scrollTop = window.pageYOffset || doc.documentElement.scrollTop;
	    return { 
	    	top: rect.top + scrollTop,
	    	left: rect.left + scrollLeft 
	    }
	}

	let style = window.getComputedStyle(div),
		pageHeight = window.innerHeight,
		pageWidth = window.innerWidth,
		pageArea = pageHeight*pageWidth,
		height = style.height,
		width = style.width,
		area = height*width,
		pos = getPos(div);
		

	console.log(div.getBoundingClientRect());


	return {
		tag: div.tagName,
		top: pos.top/pageHeight,
		left: pos.left/pageWidth,
		pageAreaRatio: area/pageArea,
		fontSize: parseInt(style.fontSize),
		fontWeight: parseInt(style.fontWeight),
		children: div.childElementCount,
		wordCount: div.textContent.replace(/([a-z]{3,})([A-Z])/g,'$1 $2').split(' ').length
	}
}



let makeDom = (html) => {
	let dom = new JSDOM(html);

	let selection = dom.window.document.getElementsByTagName('body')[0].querySelectorAll('*');

	let features = [];

	for(let i = 0; i < selection.length; i++){
		// console.log(i*100/selection.length);
		features.push(divFeatures(dom.window, selection[i]));
	}

	return features;
}

