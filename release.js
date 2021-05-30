const path = require("path");
const child_process = require("child_process");
const util = require("util");
const exec = util.promisify(child_process.exec);
const fs = require("fs/promises");

const { VERSION } = process.env;

if (!VERSION) {
  throw new Error("process.env.VERSION required");
}

const assetsPath = path.join(__dirname, "./docs", "/assets");
const packagesPath = path.join(__dirname, "./packages");
const packages = {
  builder: path.resolve(packagesPath, "./builder"),
  client: path.resolve(packagesPath, "./client"),
  language: path.resolve(packagesPath, "./language"),
  playground: path.resolve(packagesPath, "./playground"),
};

async function bumpPackageJson(cwd) {
  console.log("Bumping ", cwd);

  const pkJ = path.resolve(cwd, "./package.json");
  const content = JSON.parse(await fs.readFile(pkJ, "utf-8"));
  content.version = VERSION;

  await fs.writeFile(pkJ, JSON.stringify(content, null, 2));

  await exec(`npm install`, { cwd });

  console.log("Bumped ", cwd);
}

async function publishPlayground() {
  console.log("publishPlayground Start");

  await bumpPackageJson(packages.playground);

  await exec("npm run build", {
    stdio: [0, 1, 2],
    cwd: packages.playground,
  });

  const manifest = path.resolve(packages.playground, "./manifest-base.json");
  const manifestTo = path.join(packages.playground, "./dist", "manifest.json");
  const icon = path.resolve(assetsPath, "./dgql-icon-white.png");
  const iconTo = path.join(
    packages.playground,
    "./dist",
    "./dgql-icon-white.png"
  );

  await Promise.all(
    [
      [manifest, manifestTo],
      [icon, iconTo],
    ].map(([from, to]) => fs.copyFile(from, to))
  );

  await exec("npm pack", {
    stdio: [0, 1, 2],
    cwd: packages.playground,
  });

  console.log("publishPlayground Done");
}

async function npmPublish(cwd) {
  console.log(`Publishing ${cwd}`);

  await fs.writeFile(cwd, "//registry.npmjs.org/:_authToken=${NPM_TOKEN}");
  await exec(`npm publish`, { stdio: [0, 1, 2], cwd });

  console.log(`Published ${cwd}`);
}

async function main() {
  await Promise.all(
    [packages.builder, packages.client, packages.language].map(bumpPackageJson)
  );

  await publishPlayground();

  await Promise.all(Object.entries(packages).map(npmPublish));
}

main();