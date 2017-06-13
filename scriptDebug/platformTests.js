"use strict";
var testUtils = require("raml-1-parser-test-utils");
var path = require("path");
var fs = require("fs");
var gitBranch = require("git-branch");
function operate() {
    var commitId = process.env.TRAVIS_COMMIT;
    if (!commitId) {
        return;
    }
    var rootDir = testUtils.rootDir(__dirname);
    var parserBranch = pluginBranch("raml-1-parser", rootDir);
    if (!parserBranch) {
        console.warn("No parser branch has been detected");
        return;
    }
    testUtils.setGitUser(rootDir);
    var homeDir = path.resolve(rootDir, "../../../");
    testUtils.configureSecurity(homeDir);
    var wsDir = path.resolve(rootDir, "../");
    testUtils.cloneRepository(wsDir, "https://github.com/KonstantinSviridov/PlatformComparisonScript", { "--depth": "=1" });
    var repoDir = path.resolve(wsDir, "PlatformComparisonScript");
    testUtils.setSSHUrl(repoDir);
    testUtils.insertDummyChanges(repoDir);
    testUtils.contributeTheStorage(repoDir, ["trigger.txt"], "TARGET_BRANCH=" + parserBranch, false);
}
function pluginBranch(pluginName, folderOrDescriptor, rootFolder) {
    var descriptor = folderOrDescriptor;
    if (fs.lstatSync(descriptor).isDirectory()) {
        descriptor = path.resolve(descriptor, "workspace.json");
    }
    if (!fs.existsSync(descriptor)) {
        return null;
    }
    rootFolder = rootFolder || path.dirname(descriptor);
    var packagejsonfile = path.resolve(rootFolder, "package.json");
    if (!fs.existsSync(packagejsonfile)) {
        console.log("no package.json");
        return null;
    }
    try {
        var packagejson = JSON.parse(fs.readFileSync(packagejsonfile, "utf8"));
        if (packagejson.name != pluginName) {
            return null;
        }
    }
    catch (e) {
        console.log(e);
        return null;
    }
    console.log("rootFolder: " + rootFolder);
    fs.readdirSync(rootFolder).forEach(function (x) {
        console.log(x);
    });
    var gitFolder = path.resolve(rootFolder, ".git");
    if (fs.existsSync(gitFolder)) {
        console.log("gitFolder: " + gitFolder);
        fs.readdirSync(gitFolder).forEach(function (x) {
            console.log(x);
        });
    }
    var branchName = gitBranch.sync(rootFolder);
    if (typeof branchName == "string") {
        return branchName;
    }
    console.log("invalid branch " + branchName);
    return null;
}
operate();
//# sourceMappingURL=platformTests.js.map