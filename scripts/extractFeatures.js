let extractFeatures = (data) => {

	let cache = {};

	class Features {

		constructor(div) {
			this.div = div;
			this.style = window.getComputedStyle(div);
			this.heightPX = div.offsetHeight || 0;
			this.widthPX = div.offsetWidth || 0;
			this.page = {
				height: document.body.scrollHeight,
				width: document.body.scrollWidth
			};
		}

		all() {
			return {
				type: this.type(),
				tag: this.tag(),
				parentTag: this.parentTag(),
				// top: this.top(),
				// left: this.left(),
				height: this.height(),
				width: this.width(),
				area: this.area(),
				pageAreaRatio: this.pageAreaRatio(),
				// fontSize: this.fontSize(),
				// fontWeight: this.fontWeight(),
				numOfChildren: this.numOfChildren(),
				// textContent: this.textContent(),
				wordCount: this.wordCount(),
				// capitalWords: this.capitalWords(),
				capitalWordsCount: this.capitalWordsCount(),
				capitalToWordRatio: this.capitalToWordRatio(),
				visible: this.visible()
			}
		}

		tag() {
			return this.div.tagName;
		}

		parentTag() {
			return this.div.parentElement.tagName;
		}

		top() {
			return this.position().top / this.page.height;
		}

		left() {
			return this.position().left / this.page.width;
		}

		height() {
			return this.heightPX;
		}

		width() {
			return this.widthPX;
		}

		area() {
			return this.heightPX * this.widthPX;
		}

		pageAreaRatio() {
			return this.area() / (this.page.height * this.page.width);
		}

		fontSize() {
			return parseInt(this.style.fontSize);
		}

		fontWeight() {
			return parseInt(this.style.fontWeight);
		}

		position() {
			let rect = this.div.getBoundingClientRect(),
			    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
			    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		    return { 
		    	top: rect.top + scrollTop,
		    	left: rect.left + scrollLeft 
		    }
		}

		numOfChildren() {
			return this.div.childElementCount;
		}

		textContent() {
			return this.div.textContent.replace(/([a-z]{3,})([A-Z])/g,'$1 $2');
		}

		wordCount() {
			let match = this.textContent().match(/[a-z]+/ig);
			return match != null ? match.length : 0;
		}

		capitalWords() {
			return this.textContent().match(/[A-Z][a-z]{3,}/g) || [];
		}

		capitalWordsCount() {
			return this.capitalWords().length;
		}

		capitalToWordRatio() {
			return this.capitalWordsCount()/this.wordCount() || 0;
		}

		type() {
			let id = this.div.id;

			if(data.authorId.includes(id))
				return 'author';
			else if(data.dateId.includes(id))
				return 'date';
			else if(data.titleId.includes(id))
				return 'title';
			else
				return 'other';
		}

		visible() {
		    if (this.style.display === 'none') return false;
		    if (this.style.visibility !== 'visible') return false;
		    if (this.style.opacity < 0.1) return false;
			return true;
		}
	}

	let getFeatures = (div) => {
		return new Features(div).all();
	}

	let selection = document.getElementsByTagName('body')[0].querySelectorAll('*');
	let features = [];

	for(let i = 0; i < selection.length; i++){
		features.push(getFeatures(selection[i]));
	}

	return features;
}






let fs = require('fs');
let puppeteer = require('puppeteer');
let colors = require('colors');

console.log('Extracting Features'.underline.bold);

(async () => {

	let browser = await puppeteer.launch();
	
	let processCount;
	let finishes = 0;
	let finish = () => {
		finishes++;

		let percent = parseInt(finishes*100/processCount) + '% ';
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		process.stdout.write(percent);
		
		if(finishes >= processCount){
			browser.close();
			process.stdout.write("\n");
		}
	};

	fs.readdir('./data', (err, files) => {

		files = files.filter(file => /\.json$/.test(file));
		processCount = files.length;

		files.forEach(file => {
			(async () => {
				let page = await browser.newPage();
				let data = require('../data/'+file);

				await page.setContent(data.html);
				data.html = await page.evaluate(extractFeatures, data);

				finish();

				fs.writeFileSync('./features/'+file, JSON.stringify(data, null, 2), (err) => {
					if(err) console.log(err);
				});
			})();
		});
	});
})();