let count;

const MAX = 8;

const MUSIC = ["初音ミクの激唱", "Wizdomiot", "ウサテイ", "ハジマリノピアノ", "Life is PIANO", "Calamity Fortune", "★LittlE HearTs★", "たけるが好きなやつ"]

let choosen = [-1, -1, -1, -1, -1];

onload = function()
{
    count = -1;
}

function chooseMusic()
{
    count++;

    // 不公平
    if (count === 0)
    {
        choosen[0] = 0;
        let result = document.getElementById("result0");
        result.innerHTML = MUSIC[choosen[0]];
    } else if (count === 1)
    {
        choosen[1] = 1;
        let result = document.getElementById("result1");
        result.innerHTML = "Wizdomiot";
    } else {
        // 公平
        let music = parseInt(Math.random() * 8);        
        for (let i = 0; i < MAX; i++)
        {
            if (choosen[i] === music)
            {
                count--;
                alert("曲が被りました。もう一度してください。");
                return;
            }
        }

        choosen[count] = music;

        let result = document.getElementById("result" + count);
        result.innerHTML = MUSIC[choosen[count]];
    }
}