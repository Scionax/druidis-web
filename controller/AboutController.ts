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
	static siteNavPage = "";
	static partnerPage = "";
	
	/*
		.main-contain { display:flex; flex-direction: row; flex-wrap: nowrap; flex: 1; width:100%; border-top: solid 1px #d8c3aa; }
		.main-wrap { display: flex; flex-direction: column; flex: 1 1; padding-bottom:10px; }
		.tray { display: flex; min-height:52px; padding-right: 30px; }
		.icon { width: 48px;  }
		.linkList { display:flex; width: 100%; padding: 5px 30px 10px 48px; flex-wrap: wrap; gap: 10px; }
		.active { background-color: var(--greenLight); }
		
		.h3 { font-size: 22px; } // change to h2
		.short { font-size: 16px; font-weight: 400; color: rgb(100, 100, 100); } // to note1
		.faq-ask { flex: 1; } // to tray-mid
		
		.full { font-size: 18px; font-weight: 400; color: rgb(50, 50, 50); }		// conver to 'full text'
		.full a { text-decoration: underline dotted; }
		.full p { padding-bottom: 0 0 4px 0; }
	*/
	
	// Cached CSS
	static css = `
	<style>
	</style>
	`;
	
	async runHandler(conn: Conn): Promise<Response> {
		
		if(!conn.url2) { return await conn.sendHTML(AboutController.aboutPage); }
		if(conn.url2 === "tos") { return await conn.sendHTML(AboutController.tosPage); }
		if(conn.url2 === "privacy") { return await conn.sendHTML(AboutController.privacyPage); }
		if(conn.url2 === "questions") { return await conn.sendHTML(AboutController.questionsPage); }
		if(conn.url2 === "policies") { return await conn.sendHTML(AboutController.policiesPage); }
		if(conn.url2 === "volunteer") { return await conn.sendHTML(AboutController.volunteerPage); }
		if(conn.url2 === "site-nav") { return await conn.sendHTML(AboutController.siteNavPage); }
		if(conn.url2 === "partner") { return await conn.sendHTML(AboutController.partnerPage); }
		
		return await conn.send404();
	}
	
	static async initialize() {
		AboutController.aboutPage = await AboutController.cachePage(`/public/pages/about/about.html`, "");
		AboutController.tosPage = await AboutController.cachePage(`/public/pages/about/tos.html`, "/tos");
		AboutController.privacyPage = await AboutController.cachePage(`/public/pages/about/privacy.html`, "/privacy");
		AboutController.questionsPage = await AboutController.cachePage(`/public/pages/about/questions.html`, "/questions");
		AboutController.policiesPage = await AboutController.cachePage(`/public/pages/about/policies.html`, "/policies");
		AboutController.volunteerPage = await AboutController.cachePage(`/public/pages/about/volunteer.html`, "/volunteer");
		AboutController.siteNavPage = await AboutController.cachePage(`/public/pages/site-nav.html`, "/site-nav");
		AboutController.partnerPage = await AboutController.cachePage(`/public/pages/about/partner.html`, "/partner");
	}
	
	static applyLink(activedUrl: string, url: string, title: string) {
		if(activedUrl === url) { return `<a class="link active">${title}</a>`; }
		return `<a href="/about${url}" class="link">${title}</a>`;
	}
	
	static async cachePage(htmlPath: string, activedUrl: string) {
		const decoder = new TextDecoder("utf-8");
		const html = decoder.decode(await Deno.readFile(`${Deno.cwd()}${htmlPath}`));
		
		let links;
		
		if(activedUrl === "/site-nav") {
			links = ``;
		} else if(activedUrl === "/tos" || activedUrl === "/privacy") { 
			links = `<div class="linkList">
			${AboutController.applyLink(activedUrl, "/tos", "TOS")}
			${AboutController.applyLink(activedUrl, "/privacy", "Privacy")}
			</div>`;
		} else {
			links = `<div class="linkList">
			${AboutController.applyLink(activedUrl, "", "About")}
			${AboutController.applyLink(activedUrl, "/questions", "FAQ")}
			${AboutController.applyLink(activedUrl, "/policies", "Policies")}
			${AboutController.applyLink(activedUrl, "/volunteer", "Volunteer")}
			${AboutController.applyLink(activedUrl, "/partner", "Partner")}
			</div>`;
		}
		
		return `
		${AboutController.css}
		${links}
		${html}`;
	}
}
