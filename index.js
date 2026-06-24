import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";

const path = "./data.json";
const MIN_COMMITS = 50;
const MAX_COMMITS = 60;
const MIN_GAP_DAYS = 2;
const DAYS_IN_YEAR = 365;

const git = simpleGit();

const buildCommitDates = (count) => {
    const offsets = [];

    while (offsets.length < count) {
        const candidate = random.int(0, DAYS_IN_YEAR - 1);

        if (offsets.includes(candidate)) continue;
        if (offsets.some((offset) => Math.abs(offset - candidate) < MIN_GAP_DAYS)) continue;

        offsets.push(candidate);
    }

    return offsets
        .sort((a, b) => a - b)
        .map((offset) =>
            moment()
                .subtract(1, "year")
                .add(1, "day")
                .add(offset, "day")
                .format()
        );
};

const commitCount = random.int(MIN_COMMITS, MAX_COMMITS);
const dates = buildCommitDates(commitCount);
console.log(`Creating ${dates.length} commits on non-consecutive days`);

const writeCommitFile = (date) => {
    return new Promise((resolve, reject) => {
        const data = {
            date,
            marker: random.int(100000, 999999),
        };

        jsonfile.writeFile(path, data, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

const createCommits = async () => {
    for (let i = 0; i < dates.length; i += 1) {
        const date = dates[i];
        const commitMessage = `Commit ${i + 1} - ${date}`;

        console.log(commitMessage);
        await writeCommitFile(date);
        await git.add(path);

        const commitResult = await git.commit(commitMessage, { "--date": date });
        if (commitResult.commit === undefined) {
            console.log(`Skipped commit ${i + 1}: no changes to commit`);
        }
    }

    console.log("All commits created. Pushing to remote...");
    await git.push();
};

createCommits().catch((error) => {
    console.error("Error creating commits:", error);
    process.exit(1);
});
