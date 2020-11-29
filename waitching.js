//チャンネル一覧
const TEAM_A_SUMOU_WITCH_PLAYER = "TEAM_A_SUMOU_WITCH_PLAYER";
const TEAM_A_SUMOU_PLAYER_DATA = "TEAM_A_SUMOU_PLAYER_DATA";

//Player
const PLAYER1 = 1;
const PLAYER2 = 2;
const SPECTATOR = -1;

let player;

let channel;

let outChannel

let sending = {
	player1_exist: false,
	player2_exist: false
};

onload = async function()
{
	// webSocketリレーの初期化
	var relay = await RelayServer("achex", "chirimenSocket" );
	getChannel = await relay.subscribe(TEAM_A_SUMOU_PLAYER_DATA);
	console.log("achex web socketリレーサービスに接続しました");
	getChannel.onmessage = getMessage;
	sendPlayer();
}

let mdata;
let username;
let temperature;
let brightness;
let button;
let accelX;
let accelY;
let accelZ;

function getMessage(msg)
{
	mdata = msg.data;
	
	let setPlayer;

	switch (mdata.witchPlayer)
	{
		case PLAYER1:
			setPlayer = "player1"; 
			sending.player1_exist = true;
			break;

		case PLAYER2:
			sending.player2_exist = true;
			setPlayer = "player2";
			break;
	}

	let usernameT = document.getElementById(setPlayer + "_name");
	let temperatureT = document.getElementById(setPlayer + "_temperature");
	let brightnessT = document.getElementById(setPlayer + "_brightness");
	let buttonT = document.getElementById(setPlayer + "_button");
	let accelT = document.getElementById(setPlayer + "_accel");
	let timeT = document.getElementById(setPlayer + "_time");

	let resultT = document.getElementById(setPlayer + "_result");

	username = mdata.userId;
	temperature = mdata.sensorData.temperature;
	brightness = mdata.sensorData.brightness;
	button = mdata.sensorData.button;
	accelX = mdata.sensorData.acceleration.x;
	accelY = mdata.sensorData.acceleration.y;
	accelZ = mdata.sensorData.acceleration.z;
	let time = mdata.time;

	usernameT.innerText = mdata.userId;
	temperatureT.innerText = mdata.sensorData.temperature;
	brightnessT.innerText = mdata.sensorData.brightness;
	buttonT.innerText = mdata.sensorData.button;
	accelT.innerText = `x: ${accelX} y: ${accelY} z: ${accelZ}`;
	timeT.innerText = time;

	resultT.innerHTML = `username: ${username}<br>
				temperature: ${temperature}<br>
				brightness: ${brightness}<br>
				button: ${button}<br>
				acceleration: x: ${accelX} y: ${accelY} z: ${accelZ}<br>
				time: ${time}`;

	console.log("取得");
}

async function sendPlayer()
{
	let relay = await RelayServer("achex", "chirimenSocket" );
	outChannel = await relay.subscribe(TEAM_A_SUMOU_WITCH_PLAYER);

	while (true)
	{
		outChannel.send(sending);

		await sleep(500);
	}
}