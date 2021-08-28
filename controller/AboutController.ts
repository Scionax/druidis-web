import Conn from "../core/Conn.ts";
import WebController from "./WebController.ts";

export default class AboutController extends WebController {
	
	// Cached HTML
	static aboutPage = "";
	static tosPage = "";
	static privacyPage = "";
	static questionsPage = "";
	static policiesPage = "";
	static volunteerPage = "";
	
	// Cached CSS
	static aboutCss = `
	<style>
		.faq-contain { display:flex; flex-direction: row; flex-wrap: nowrap; flex: 1; width:100%; border-top: solid 1px #d8c3aa; }
		.faq-wrap { display: flex; flex-direction: column; flex: 1 1; padding-bottom:10px; }
		.faq-tray { display: flex; min-height:52px; padding-right: 30px; }
		.faq-icon { width: 48px;  }
		.faq-ask { flex: 1; width:100%; }
		.faq-ask .h3 { font-size: 22px; }
		.short { font-size: 16px; font-weight: 400; color: rgb(100, 100, 100); }
		.full { font-size: 18px; font-weight: 400; color: rgb(50, 50, 50); padding: 0px 30px 6px 48px; }
		.full p { padding-bottom: 0 0 4px 0; }
		.linkList { display:flex; width: 100%; padding: 5px 30px 10px 48px; flex-wrap: wrap; gap: 10px; }
		.highlight { background-color: var(--hoverGreenLight); }
	</style>
	`;
	
	async runHandler(conn: Conn): Promise<Response> {
		
		if(!conn.url2) { return await conn.sendHTML(AboutController.aboutPage); }
		if(conn.url2 === "tos") { return await conn.sendHTML(AboutController.tosPage); }
		if(conn.url2 === "privacy") { return await conn.sendHTML(AboutController.privacyPage); }
		if(conn.url2 === "questions") { return await conn.sendHTML(AboutController.questionsPage); }
		if(conn.url2 === "policies") { return await conn.sendHTML(AboutController.policiesPage); }
		if(conn.url2 === "volunteer") { return await conn.sendHTML(AboutController.volunteerPage); }
		
		return await conn.send404(WebController.bad404);
	}
	
	static async initialize() {
		AboutController.aboutPage = await AboutController.cachePage(`/public/pages/about.html`, "/about");
		AboutController.tosPage = await AboutController.cachePage(`/public/pages/tos.html`, "/about/tos");
		AboutController.privacyPage = await AboutController.cachePage(`/public/pages/privacy.html`, "/about/privacy");
		AboutController.questionsPage = await AboutController.cachePage(`/public/pages/questions.html`, "/about/questions");
		AboutController.policiesPage = await AboutController.cachePage(`/public/pages/policies.html`, "/about/policies");
		AboutController.volunteerPage = await AboutController.cachePage(`/public/pages/volunteer.html`, "/about/volunteer");
	}
	
	static applyLink(highlightedUrl: string, url: string, title: string) {
		if(highlightedUrl === url) { return `<a class="crumb highlight">${title}</a>`; }
		return `<a href="${url}" class="crumb">${title}</a>`;
	}
	
	static async cachePage(htmlPath: string, highlightedUrl: string) {
		const decoder = new TextDecoder("utf-8");
		const html = decoder.decode(await Deno.readFile(`${Deno.cwd()}${htmlPath}`));
		
		let links;
		
		if(highlightedUrl === "/about/tos" || highlightedUrl === "/about/privacy") { 
			links = `
			${AboutController.applyLink(highlightedUrl, "/about/tos", "TOS")}
			${AboutController.applyLink(highlightedUrl, "/about/privacy", "Privacy")}
			`;
		} else {
			links = `
			${AboutController.applyLink(highlightedUrl, "/about", "About")}
			${AboutController.applyLink(highlightedUrl, "/about/questions", "FAQ")}
			${AboutController.applyLink(highlightedUrl, "/about/policies", "Policies")}
			${AboutController.applyLink(highlightedUrl, "/about/volunteer", "Volunteer")}
			`;
		}
		
		
		return `
		${WebController.header}
		${WebController.headerCloser}
		${WebController.panelOpen}
		${WebController.panelClose}
		${AboutController.aboutCss}
		
		<!-- Layout: About Section -->
		<div id="main-section" class="layoutMain">
			
			<div class="linkList">${links}</div>
			
			${html}
			
		</div>
	
		${WebController.pageClose}
		${WebController.footer}`;
	}
}
