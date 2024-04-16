import config from './../../config.js';
import DialogClass from './../../libs/popup.js';

class HelpAboutClass {

	constructor() {
		this.POP = new DialogClass();
	}

	// About
	about() {
		var email = 'www.viliusl@gmail.com';	
		
		var settings = {
			title: 'About',
			params: [
				{title: "", html: '<img style="width: 64px;" class="about-logo" alt="MiniPaint" src="images/logo-colors.png" />'},
				{title: "Name:", html: '<span class="about-name">MiniPaint</span>'},
				{title: "Version:", value: VERSION},
				{title: "Description:", value: "Online Image Editor"},
				{title: "Author:", value: 'ViliusL'},
				{title: "Email:", html: '<a href="mailto:' + email + '" title="' + email + '">' + email + '</a>'},
				{title: "GitHub:", html: '<a href="https://github.com/Viliusle/MiniPaint" title="https://github.com/Viliusle/MiniPaint">https://github.com/Viliusle/MiniPaint</a>'},
				{title: "Website:", html: '<a href="https://viliusle.github.io/MiniPaint/" title="https://viliusle.github.io/MiniPaint/">https://viliusle.github.io/MiniPaint/</a>'},
			],
		};
		
		this.POP.show(settings);
	}

}

export default HelpAboutClass;
