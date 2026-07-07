import chalk from "chalk";

function isNewer(latest, current) {
  const [lMajor, lMinor, lPatch] = latest.split(".").map(Number);
  const [cMajor, cMinor, cPatch] = current.split(".").map(Number);

  if (lMajor !== cMajor) return lMajor > cMajor;
  if (lMinor !== cMinor) return lMinor > cMinor;
  return lPatch > cPatch;
}

export function checkForUpdate(packageName, currentVersion) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);

  return fetch(`https://registry.npmjs.org/${packageName}/latest`, { signal: controller.signal })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => (data && isNewer(data.version, currentVersion) ? data.version : null))
    .catch(() => null)
    .finally(() => clearTimeout(timeout));
}

export function printUpdateWarning(packageName, currentVersion, latestVersion) {
  console.log(
    chalk.yellow(
      `\nA new version of ${packageName} is available: ${currentVersion} → ${latestVersion}\n` +
        `Run \`npm i -g ${packageName}\` to update.`,
    ),
  );
}
