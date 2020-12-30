//チャンネル一覧
const SUMOU_NG_FROM_JOIN = "SUMOU_NG_FROM_JOIN";
const SUMOU_NG_FROM_HOST = "SUMOU_NG_FROM_HOST";

//Player
const PLAYER1 = 1;
const PLAYER2 = 2;
const SPECTATOR = -1;

//リレー
let relay;

//チャンネル
let channelCode;
let inChannel;

//送られてくる
let sending = {
	player1_exist: false,
	player2_exist: false
};

async function connect()
{
	channelCode = document.getElementById("channelCode").value;

	relay = await RelayServer("achex", "chirimenSocket" );
	inChannel = await relay.subscribe(channelCode + SUMOU_NG_FROM_JOIN);//join.jsのmicro:bitのデータを取得する用のチャンネルを設定
	inChannel.onmessage = getMessage;//join.jsからデータを取得したとき
	console.log("achex web socketリレーサービスに接続しました");
}

let getData;
function getMessage(msg)
{
	getData = msg.data;
	
	let setPlayer = (getData.whichPlayer == PLAYER1) ? "player1" : "player2";//送られてきたデータが "player1" か "player2" かを調べる

	console.log(getData);

	getMBitSensor(setPlayer);//プレイヤーのmicro:bitのセンサのデータを表示(第一引数: playerの種類, 第二引数: micro:bitのセンサなどのデータ)
}


//micro:bitの値を格納する変数
let username;
let temperature;
let brightness;
let button;
let accelX;
let accelY;
let accelZ;
let acc;
//センサの値を取得 + 表示
function getMBitSensor(player)
{
	let usernameT = document.getElementById(player + "_name");
	let temperatureT = document.getElementById(player + "_temperature");
	let brightnessT = document.getElementById(player + "_brightness");
	let buttonT = document.getElementById(player + "_button");
	let accelT = document.getElementById(player + "_accel");
	let timeT = document.getElementById(player + "_time");

	let resultT = document.getElementById(player + "_result");

	username = getData.userId;
	temperature = getData.sensorData.temperature;
	brightness = getData.sensorData.brightness;
	button = getData.sensorData.button;
	accelX = getData.sensorData.acceleration.x;
	accelY = getData.sensorData.acceleration.y;
	accelZ = getData.sensorData.acceleration.z;
	let time = getData.time;

	acc = {
		x: accelX,
		y: accelY,
		z: accelZ,
	}

	usernameT.innerText = getData.userId;
	temperatureT.innerText = getData.sensorData.temperature;
	brightnessT.innerText = getData.sensorData.brightness;
	buttonT.innerText = getData.sensorData.button;
	accelT.innerText = `x: ${accelX} y: ${accelY} z: ${accelZ}`;
	timeT.innerText = time;

	resultT.innerHTML = `username: ${username}<br>
				temperature: ${temperature}<br>
				brightness: ${brightness}<br>
				button: ${button}<br>
				acceleration: x: ${accelX} y: ${accelY} z: ${accelZ}<br>
				time: ${time}`;

	console.log("micro:bitの値を取得！");
}

// async function sendPlayer()
// {
// 	relay = await RelayServer("achex", "chirimenSocket" );

// 	while (true)
// 	{
// 		outChannel.send(sending);

// 		await sleep(500);
// 	}
// }