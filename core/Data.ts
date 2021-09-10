// This class provides helper functions for modifying data.

export default abstract class Data {
	
	static async getFilesRecursive(baseDir: string, relativeDir = ""): Promise<string[]> {
		const path = `${Deno.cwd()}/${baseDir}${relativeDir}`;
		let files: string[] = [];
		
		for await (const dirEntry of Deno.readDir(path)) {
			if(dirEntry.isFile) {
				files.push(`${relativeDir}/${dirEntry.name}`);
			} else if(dirEntry.isDirectory) {
				files = files.concat(await Data.getFilesRecursive(baseDir, `${relativeDir}/${dirEntry.name}`));
			}
		}
		
		return files;
	}
}
