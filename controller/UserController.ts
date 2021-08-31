import Conn from "../core/Conn.ts";
import WebController from "./WebController.ts";

export default class UserController extends WebController {
	
	// Cached HTML
	static userPage = "";
	static loginPage = "";
	static signupPage = "";
	
	// Cached CSS
	static css = `
	<style>
	</style>
	`;
	
	async runHandler(conn: Conn): Promise<Response> {
		
		// if(!conn.url2) { return await conn.sendHTML(UserController.userPage); }
		if(conn.url2 === "login") { return await conn.sendHTML(UserController.loginPage); }
		if(conn.url2 === "sign-up") { return await conn.sendHTML(UserController.signupPage); }
		
		return await conn.send404(WebController.bad404);
	}
	
	static async initialize() {
		// UserController.userPage = await UserController.cachePage(`/public/pages/user/user.html`, "");
		UserController.loginPage = await UserController.cachePage(`/public/pages/user/login.html`, "/login");
		UserController.signupPage = await UserController.cachePage(`/public/pages/user/sign-up.html`, "/sign-up");
	}
	
	static async cachePage(htmlPath: string, activeUrl: string) {
		const decoder = new TextDecoder("utf-8");
		const html = decoder.decode(await Deno.readFile(`${Deno.cwd()}${htmlPath}`));
		
		let script = "";
		
		if(activeUrl === "/login") {
			script = ``;
		} else if(activeUrl === "/sign-up") {
			script = `<script src="/public/scripts/druidis-login.js" defer></script>`;
		}
		
		return `
		${WebController.header}
		${script}
		${WebController.headerCloser}
		${WebController.panelOpen}
		${WebController.panelClose}
		${UserController.css}
		
		<!-- Layout: About Section -->
		<div id="main-section" class="layoutMain">
			${html}
		</div>
	
		${WebController.pageClose}
		${WebController.footer}`;
	}
}
