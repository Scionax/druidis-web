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
		${links}
		${html}`;
	}
}
