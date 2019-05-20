module.exports = () => {

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
				tag: this.tag(),
				parentTag: this.parentTag(),
				top: this.top(),
				left: this.left(),
				height: this.height(),
				width: this.width(),
				area: this.area(),
				pageAreaRatio: this.pageAreaRatio(),
				fontSize: this.fontSize(),
				fontWeight: this.fontWeight(),
				numOfChildren: this.numOfChildren(),
				textContent: this.textContent(),
				wordCount: this.wordCount(),
				nouns: this.nouns(),
				nounCount: this.nounCount(),
				nounsToWordsRatio: this.nounsToWordsRatio()
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
			return this.div.textContent.replace(/([a-z]{3,})([A-Z])/g,'$1 $2').replace(/\s{2,}/, ' ');
		}

		wordCount() {
			let match = this.textContent().match(/[a-z]+/ig);
			return match != null ? match.length : 0;
		}

		nouns() {
			let doc = window.nlp(this.textContent());
			return doc.nouns().out();
		}

		nounCount() {
			let match = this.nouns().match(/[a-z]+/ig)
			return match != null ? match.length : 0;
		}

		nounsToWordsRatio() {
			return this.nounCount()/this.wordCount() || 0;
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