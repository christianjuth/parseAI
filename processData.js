let fs = require('fs');
let puppeteer = require('puppeteer');
let extractFeatures = require('./extractFeatures');

(async () => {

	let data = require('./data/1558147484099_washingtonexaminer_Newspaper-tells-staff-to-use-climate-emergency-and-climate-denier-in-news-stories.json');
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
				let data = require('./data/'+file);

				await page.setContent(data.html);
				await page.addScriptTag({url: 'https://unpkg.com/compromise@11.13.2/builds/compromise.min.js'});
				data.html = await page.evaluate(extractFeatures);

				finish();

				fs.writeFileSync('./features/'+file, JSON.stringify(data, null, 2), (err) => {
					if(err) console.log(err);
				});
			})();
		});
	});

	
})();