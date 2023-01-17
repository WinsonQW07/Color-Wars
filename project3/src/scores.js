export {setScore, writeArr, scoreSplitArr};

const prefix = "wqw7732-";
const searchScores = prefix + "score";
const storedScores = localStorage.getItem(searchScores);

let scoreSplitArr = [];

let scoreArr = [];

//gets the saved scores from the storage if there are any
if(storedScores != null)
{
    scoreSplitArr = storedScores.split(",")
    scoreArr = scoreSplitArr;
}

//saves the scores into local storage
function setScore(score)
{
    if(storedScores == null)
    {
        scoreSplitArr.push(score);
    }
    scoreArr.push(score);

    //orders the array
    scoreArr.sort(function(a,b){return b-a});

    //makes sure there are only the top 5 highest scores
    if(scoreArr.length > 5)
    {
        scoreArr.pop();
    }

    localStorage.setItem(searchScores, scoreArr);
}

function writeArr()
{
    console.log(scoreSplitArr);
}