import testUtils = require("raml-1-parser-test-utils");
import path = require("path");
import fs = require("fs");
var gitBranch = require("git-branch");

function operate(){

    let commitId = process.env.TRAVIS_COMMIT;
    if (!commitId) {
        return;
    }

    let rootDir = testUtils.rootDir(__dirname);
    let parserBranch = testUtils.pluginBranch("raml-1-parser",rootDir);
    if(!parserBranch){
        console.warn("No parser branch has been detected");
        return;
    }

    testUtils.setGitUser(rootDir);
    let homeDir = path.resolve(rootDir, "../../../");
    testUtils.configureSecurity(homeDir);

    let wsDir = path.resolve(rootDir, "../");

    testUtils.cloneRepository(
        wsDir,
        "https://github.com/KonstantinSviridov/PlatformComparisonScript",
        {"--depth": "=1"});

    let repoDir = path.resolve(wsDir, "PlatformComparisonScript");
    testUtils.setSSHUrl(repoDir);
    testUtils.insertDummyChanges(repoDir);

    testUtils.contributeTheStorage(repoDir, ["trigger.txt"], `TARGET_BRANCH=${parserBranch}`, false);
}

function pluginBranch(pluginName:string,folderOrDescriptor:string, rootFolder?:string):string{

    let descriptor:string = folderOrDescriptor;
    if(fs.lstatSync(descriptor).isDirectory()){
        descriptor = path.resolve(descriptor,"workspace.json");
    }
    if(!fs.existsSync(descriptor)){
        return null;
    }
    rootFolder = rootFolder || path.dirname(descriptor);
    let packagejsonfile = path.resolve(rootFolder,"package.json");
    if(!fs.existsSync(packagejsonfile)){
        console.log("no package.json");
        return null;
    }
    try {
        let packagejson = JSON.parse(fs.readFileSync(packagejsonfile,"utf8"));
        if(packagejson.name != pluginName){
            return null;
        }
    }
    catch (e){
        console.log(e);
        return null;
    }
    console.log("rootFolder: " + rootFolder);
    fs.readdirSync(rootFolder).forEach(x=>{
       console.log(x);
    });
    let gitFolder = path.resolve(rootFolder,".git");
    if(fs.existsSync(gitFolder)){
        console.log("gitFolder: " + gitFolder);
        fs.readdirSync(gitFolder).forEach(x=>{
            console.log(x);
        });
    }
    let branchName = gitBranch.sync(rootFolder);
    if(typeof branchName == "string") {
        return branchName;
    }
    console.log("invalid branch " + branchName);
    return null;
}

operate();