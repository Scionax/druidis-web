import Conn from "../core/Conn.ts";
import WebController from "./WebController.ts";

export default class UserController extends WebController {
	
	// Cached HTML
	static loginPage = "";
	static signupPage = "";
	
	async runHandler(conn: Conn): Promise<Response> {
		
		// if(!conn.url2) { return await conn.sendHTML(UserController.userPage); }
		if(conn.url2 === "login") { return await conn.sendHTML(UserController.loginPage); }
		if(conn.url2 === "sign-up") { return await conn.sendHTML(UserController.signupPage); }
		
		return await conn.send404();
	}
	
	static async initialize() {
		const decoder = new TextDecoder("utf-8");
		UserController.loginPage = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/pages/user/login.html`));
		UserController.signupPage = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/pages/user/sign-up.html`));
	}
}
