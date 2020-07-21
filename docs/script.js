// Exemplo de envio de dados para o Ubidots
// url = "https://industrial.api.ubidots.com/api/v1.6/devices/my-new-device"
// Para o exemplo do grupo20 da T24: my-new-device = simulador-t24-11a20
// Device = dispositivo criado (ou a ser criado) no Ubidots

const tokens = {
	'21': 'BBFF-FukjG5drP21TGHxG8ZHklRlVctcwjF',
	'22': 'BBFF-raPU9fVpENnd00E18dyUtFioubzvUl',
	'23': 'BBFF-jhQu3sb7mCKSP8LczeZOeKMeIuVCHK',
	'24': 'BBFF-qAA5hxwN40of9tGSIkunVt9Ox4URGs'
};

$(document).ready(function () {
	// Temp set-up
	$('#temperatura').val(45);
	
	// 'Turma' select set-up
	for (let turma in tokens) {
		const opt = $(`<option value="${turma*1}">${turma}</option>`);
		$('select#turma').append(opt);
	}
	
	//  select set-up
	for (let i = 1; i <= 20; i++) {
		$('#grupo').append($(`<option value="${i}">${i}</option>`));
	}
});

function requester (turma, grupo, value, callback) {
	const Http = new XMLHttpRequest();
	
	const token = tokens[turma];
	const range = grupo * 1 <= 10 ? '01a10' : '11a20'
	const url = `https://industrial.api.ubidots.com/api/v1.6/devices/simulador-t${turma}-${range}`;
	
	const dado = `{"grupo${grupo}":${value}}`;
	
	Http.open("POST", url);
	
	Http.setRequestHeader("X-Auth-Token", token);
	Http.setRequestHeader("Content-Type", "application/json");
	
	Http.onload = callback ? () => {
		console.log(`Dados: ${dado}`)
		console.log(`Turma: ${turma}, Grupo: ${grupo}, Value: ${value}, url: ${url}`);
		callback(Http, turma, grupo, value);
	} : () => {
		console.log(Http.responseText);
		Http.responseText.includes("201") ? console.log('Deu certo') : console.log('Deu errado');
		console.log(Http);
	}
	
	Http.send(dado);
}

$('#send').click(function () {
	const classTeam = $('select#turma').val();
	const grupo = $('select#grupo').val();
	const temp = $("#temperatura").val();
	
	const $liShow = $('<li class="one-send"></li>');
	$liShow.append($(`<mark>Alterando Valor para ${temp} do grupo ${grupo}, turma ${classTeam}</mark>`));
	
	requester (classTeam, grupo, temp, Http => {
		if (Http.responseText.includes("201")) {
			$liShow.addClass('right');
			$liShow.append(`<p>Sucesso - Turma: ${classTeam}, Grupo: ${grupo}, Valor: ${temp}</p>`);
		} else {
			$liShow.addClass('wrong');
			$liShow.append(`<p>Error - Turma: ${classTeam}, Grupo: ${grupo}, Valor: ${temp}</p>`);
		}
		$('#resultados').append($liShow);
	});
});

$('#explode').click(function () {
	console.warn('Inicializando Destruição..');

	let classTeam = 21;
	let group = 1;
	const timing = $('#timing-explode').val() * 1 || 500;
	const val = $('#val-explode').val() * 1
	const randomNumberValid = () => (Math.random() * 100).toFixed(2)
	const $attacList__container = $(`
		<li class="attac-list__container">
			<mark>Inicializando Destruição.. (Destruição em cerca de ${4*20*timing/1000} segundos)</mark>
		</li>
	`);
	const $attacList = $('<ul class="attac-list"></ul>');
	$($attacList__container).append($attacList);
	$('#resultados').append($attacList__container);
	
	const id = setInterval(() => {
		if (classTeam > 24) {
			console.log('Finalizado!');
			clearInterval(id);
			return null;
		}
		requester(classTeam, group, val || randomNumberValid(), (Http, turma, group, val) => {
			if (Http.responseText.includes("201")) {
				console.log('Deu certo');
				$attacList.append($(`<li class="right">Deu certo - Turma: ${turma}, Grupo: ${group}, Valor: ${val || randomNumberValid()};</li>`));
			} else {
				console.log('Deu errado');
				$attacList.append($(`<li class="wrong">Deu erro - Turma: ${turma}, Grupo: ${group}, Valor: ${val || randomNumberValid()};</li>`));
			}
		})
		group++;
		if (group > 20) {
			classTeam++;
			group = 1;
		}
	}, timing);
})