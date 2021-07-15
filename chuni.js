// 何回ルーレットをまわしたのかを格納する変数
let count;

// ルーレットの最大回数
const MAX = 8;

// 曲
const MUSIC = ["初音ミクの激唱", "Wizdomiot", "ウサテイ", "ハジマリノピアノ", "Life is PIANO", "Calamity Fortune", "★LittlE HearTs★", "たけるが好きなやつ"]

// 何の曲が選ばれたのかを記録する配列(変数)
let choosen = [-1, -1, -1, -1, -1];

// ページがロードされたときに、ルーレットをまわした回数-1にする。
onload = function()
{
    count = -1;
}

function chooseMusic()// ボタンが押されたときに実行される
{
    count++;// 一回まわす

    // 不公平
    if (count === 0)// ルーレットが1回目
    {
        choosen[0] = 0;                         // 最初に選ばれる曲を「初音ミクの激唱」に設定
        let result = document.getElementById("result0");
        result.innerHTML = MUSIC[choosen[0]];   // ページに書き込む
    } else if (count === 1)// ルーレットが2回目
    {
        choosen[1] = 1;                         // 2回目の曲を「Wizdomiot」に設定
        let result = document.getElementById("result1");
        result.innerHTML = "Wizdomiot";         // ページに書き込む
    } else {// ルーレットが3回目以降
        // 公平
        let music = parseInt(Math.random() * 8);// 曲をランダムに選ぶ      
        for (let i = 0; i < MAX; i++)// ランダムで出した曲が被っていないか確認
        {
            if (choosen[i] === music)// 曲が被っているとき
            {
                count--;
                alert("曲が被りました。もう一度してください。");
                return;                         // 強制終了
            }
        }

        choosen[count] = music;                 // 曲を選択

        let result = document.getElementById("result" + count);
        result.innerHTML = MUSIC[choosen[count]];// ページに書き込む
    }
}