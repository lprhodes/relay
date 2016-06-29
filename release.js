const fs = require('fs');
const https = require('https');
const url = require('url');
const spawnSync = require('child_process').spawnSync;

const githubToken = process.argv[2];
if (!githubToken) {
    console.log('Usage: node release.js [GITHUB-TOKEN]');
    process.exit(1);
}

function package(path) {
    return JSON.parse(fs.readFileSync(path + '/package.json', 'utf8'));
}

function pack(path) {
    const pkg = package(path);
    const tarball = pkg.name + '-' + pkg.version + '.tgz';
    console.log('* Creating ' + tarball);
    const command = spawnSync('npm', ['pack', path]);
    if (command.status != 0) {
        throw new Error('[!] npm pack ' + path);
    }
    return tarball;
}

function createGHRelease(completion) {
    const version = package('.').version;
    const commit = spawnSync('git', ['rev-parse', 'HEAD']).stdout.toString('utf8').trim();
    console.log('* Creating GitHub release for v' + version + ' at ' + commit);

    const postData = JSON.stringify({
        tag_name: 'v' + version,
        name: 'v' + version,
        target_commitish: commit,
        body: 'Uses `__id` as Node ID',
    });

    const options = {
        hostname: 'api.github.com',
        port: 443,
        path: '/repos/alloy/relay/releases',
        method: 'POST',
        headers: {
            'Authorization': 'token ' + githubToken,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'alloy',
        }
    };

    const responseData = [];

    const req = https.request(options, (res) => {
        res.on('data', (chunk) => {
            responseData.push(chunk);
        });
        res.on('end', () => {
            const responseJSON = Buffer.concat(responseData).toString('utf8');
            if (res.statusCode == 422 && JSON.parse(responseJSON).errors[0].field === 'target_commitish') {
                throw new Error('[!] Failed to create GitHub release: commit does not exist on remote, did you forget to push?');
            } else if (res.statusCode != 201) {
                throw new Error('[!] Failed to create GitHub release: ' + responseJSON);
            }
            completion(JSON.parse(responseJSON));
        });
    });
    req.on('error', (e) => {
        throw new Error('[!] Failed to create GitHub release: ' + e);
    });
    req.write(postData);
    req.end();
}

function uploadReleaseAsset(asset, uploadURL, completion) {
    console.log('* Uploading asset: ' + uploadURL);
    const URL = url.parse(uploadURL);

    const postData = fs.readFileSync(asset);

    const options = {
        hostname: URL.host,
        port: 443,
        path: URL.path,
        method: 'POST',
        headers: {
            'Authorization': 'token ' + githubToken,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/gzip',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'alloy',
        }
    };

    const responseData = [];

    const req = https.request(options, (res) => {
        res.on('data', (chunk) => {
            responseData.push(chunk);
        });
        res.on('end', () => {
            const binary = Buffer.concat(responseData);
            completion(JSON.parse(binary.toString('utf8')));
        });
    });
    req.on('error', (e) => {
        throw new Error('[!] Failed to create GitHub release: ' + e);
    });
    req.write(postData);
    req.end();
}

const packages = [
    pack('.'),
    pack('scripts/babel-relay-plugin'),
];

createGHRelease((response) => {
    packages.forEach((package) => {
        const uploadURL = response.upload_url.replace('{?name,label}', '?name=' + package);
        uploadReleaseAsset(package, uploadURL, (uploadResponse) => {
            console.log('* Asset uploaded: ' + uploadResponse.browser_download_url);
        });
    });
});