import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";

const path = "./data.json";

// Makes commits at a SPECIFIC x,y position on the graph
const markCommit = (x, y) => {
    const date = moment()
        .subtract(1, "y")
        .add(1, "d")
        .add(x, "w")
        .add(y, "d")
        .format();

    const data = { date };

    jsonfile.writeFile(path, data, () => {
        simpleGit().add([path]).commit(date, { "--date": date }).push();
    });
};

// Makes n RANDOM commits spread across the past year
const makeCommits = (n) => {
    if (n === 0) return simpleGit().push();

    const x = random.int(0, 54); // week (0-54)
    const y = random.int(0, 6);  // day of week (0-6)

    const date = moment()
        .subtract(1, "y")
        .add(1, "d")
        .add(x, "w")
        .add(y, "d")
        .format();

    const data = { date };

    console.log(date);

    jsonfile.writeFile(path, data, () => {
        simpleGit()
            .add([path])
            .commit(date, { "--date": date }, makeCommits.bind(this, --n));
    });
};

makeCommits(100); // Change 100 to however many commits you want
