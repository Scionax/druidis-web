import Conn from "../core/Conn.ts";
import WebController from "./WebController.ts";

export default class AboutController extends WebController {
	
	// Cached HTML
	static bad404 = "";
	static aboutPage = "";
	static tosPage = "";
	static privacyPage = "";
	
	async runHandler(conn: Conn): Promise<Response> {
		
		if(!conn.url2) { return await conn.sendHTML(AboutController.aboutPage); }
		if(conn.url2 === "tos") { return await conn.sendHTML(AboutController.tosPage); }
		if(conn.url2 === "privacy") { return await conn.sendHTML(AboutController.privacyPage); }
		
		return await conn.send404(WebController.bad404);
	}
	
	static async initialize() {
		AboutController.aboutPage = await AboutController.cachePage(`/public/pages/about.html`);
		AboutController.tosPage = await AboutController.cachePage(`/public/pages/tos.html`);
		AboutController.privacyPage = await AboutController.cachePage(`/public/pages/privacy.html`);
	}
	
	static async cachePage(htmlPath: string) {
		const decoder = new TextDecoder("utf-8");
		const html = decoder.decode(await Deno.readFile(`${Deno.cwd()}${htmlPath}`));
		
		return `
		${WebController.header}
		${WebController.headerCloser}
		${WebController.panelOpen}
		${WebController.panelClose}
		${html}
		${WebController.pageClose}
		${WebController.footer}`;
	}
}
