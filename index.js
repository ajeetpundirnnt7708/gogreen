import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";

const path = "./data.json";
const MIN_COMMITS = 50;
const MAX_COMMITS = 60;
const MIN_GAP_DAYS = 2;
const DAYS_IN_YEAR = 365;

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

const makeCommits = (commitDates, index = 0) => {
    if (index >= commitDates.length) {
        console.log("All commits created. Pushing to remote...");
        return simpleGit().push();
    }

    const date = commitDates[index];
    const data = { date };
    console.log(`Commit ${index + 1}: ${date}`);

    jsonfile.writeFile(path, data, () => {
        simpleGit()
            .add([path])
            .commit(`Commit ${index + 1} - ${date}`, { "--date": date }, () => makeCommits(commitDates, index + 1));
    });
};

makeCommits(dates);
