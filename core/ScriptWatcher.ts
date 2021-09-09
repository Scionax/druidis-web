import { config } from "../config.ts";
import { minify } from "https://deno.land/x/minifier@v1.1.1/mod.ts";
import { log } from "../deps.ts";

export default abstract class ScriptWatcher {
    
    static runUpdateTime = 0;
    
	// Run Script File Watcher (local / dev only)
	static initialize() {
		if(!config.local) { return; }
		log.info("Loading File Watcher for Scripts (Local Only)");
		ScriptWatcher.watchForScriptUpdates();
		ScriptWatcher.watchFileQueue();
	}
	
	static async watchForScriptUpdates() {
		const watcher = Deno.watchFs("../../scripts");
		
		// Asynchronous Loop: perpetually looks for any changes in the Scripts folder.
		for await(const event of watcher) {
			
			// We only care about files being modified.
			if(event.kind !== "modify") { continue; }
			
			// Only update when .ts files are changed. Ignore "_build.ts"
			const fileChanged = event.paths[0];
			
			if(fileChanged && fileChanged.indexOf(".ts") > -1 && !(fileChanged.indexOf("_build") > -1)) {
				log.debug(`Script file modified: ${fileChanged}`);
				ScriptWatcher.runUpdateTime = Date.now() + 350;
			}
		}
	}
	
	// Watches to see if files need to be updated and bundled. If so, passes the instruction to runScriptBuilder().
	static watchFileQueue() {
		setTimeout(ScriptWatcher.watchFileQueue, 500);
		
		// If we've passed the update time check, it means there are files waiting to be updated.
		if(ScriptWatcher.runUpdateTime !== 0 && ScriptWatcher.runUpdateTime < Date.now()) {
			ScriptWatcher.runScriptBuilder();
		}
	}
	
	// Run the custom Script Builder
	static async runScriptBuilder() {
		log.debug("Updating and Bundling Script Files...");
		ScriptWatcher.runUpdateTime = 0;
		
		// Prepare Important Directories & Files
		const scriptDir = "../../scripts";
		const buildFile = `${scriptDir}/_build.ts`;
		const thisProjectFile = `./public/druidis.js`;
		const scriptProjectFile = `${scriptDir}/_build.js`;
		
		// Get a list of the scripts. Ignore any preceded with "_" or with .js
		// const fileNames: string[] = [];
		let typescriptContent = "";
		
		for await(const dirEntry of Deno.readDir(scriptDir)) {
			
			// Get all .ts files. Ignore any files that are preceded with "_" or with .js
			if(dirEntry.isFile && dirEntry.name.indexOf(".ts") > -1 && dirEntry.name.indexOf("_") !== 0) {
				// fileNames.push(dirEntry.name);
				const fileContents = await Deno.readTextFile(`${scriptDir}/${dirEntry.name}`);
				
				typescriptContent += `
				${fileContents}`;
			}
		}
		
		// Combine the Scripts into a single file named "_build.ts"
		await Deno.writeTextFile(buildFile, typescriptContent);
		
		// Run the Deno Bundler on the script.
		const { files } = await Deno.emit(buildFile, { bundle: "module", compilerOptions: { allowUnreachableCode: true }  });
		let bundledJs = files["deno:///bundle.js"];
		
		// Minifiy the JS Code
		bundledJs = minify("js", bundledJs);
		
		// Copy the Bundled JS. Save to a new file in both projects.
		await Deno.writeTextFile(thisProjectFile, bundledJs);
		await Deno.writeTextFile(scriptProjectFile, bundledJs);
		
		log.debug(`Updated druidis.js script.`);
	}
}

