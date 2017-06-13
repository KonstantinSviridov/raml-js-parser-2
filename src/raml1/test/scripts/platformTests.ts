import testUtils = require("raml-1-parser-test-utils");
import path = require("path");
import fs = require("fs");

function operate(){
    let commitId = process.env.TRAVIS_COMMIT;
    if (!commitId) {
        return;
    }

    let rootDir = testUtils.rootDir(__dirname);
    testUtils.setSSHUrl(rootDir);
    testUtils.setGitUser(rootDir);
    let homeDir = path.resolve(rootDir, "../../../");
    testUtils.configureSecurity(homeDir);

    let wsDir = path.resolve(rootDir, "../");

    testUtils.cloneRepository(
        wsDir,
        "https://github.com/KonstantinSviridov/PlatformComparisonScript",
        {"--depth": "=1"});

    let repoDir = path.resolve(wsDir, "PlatformComparisonScript");
    testUtils.insertDummyChanges(repoDir);

    testUtils.contributeTheStorage(rootDir, ["trigger.txt"], `TARGET_COMMIT=${commitId}`, true);
}

operate();