// Exemplo de envio de dados para o Ubidots
// url = "https://industrial.api.ubidots.com/api/v1.6/devices/my-new-device"
// Para o exemplo do grupo20 da T24: my-new-device = simulador-t24-11a20
// Device = dispositivo criado (ou a ser criado) no Ubidots

const randomNumberValid = () => (Math.random() * 100).toFixed(2)

const tokens = {
	'21': 'BBFF-FukjG5drP21TGHxG8ZHklRlVctcwjF',
	'22': 'BBFF-raPU9fVpENnd00E18dyUtFioubzvUl',
	'23': 'BBFF-jhQu3sb7mCKSP8LczeZOeKMeIuVCHK',
	'24': 'BBFF-qAA5hxwN40of9tGSIkunVt9Ox4URGs'
};

// true => 01-10, false => 1-10
const linkRangeSituation = {
	'21': false,
	'22': true,
	'23': true,
	'24': false
}

// true => grupo01, false => grupo1
const groupZeroSituation = {
	'21': true,
	'22': false,
	'23': false,
	'24': true
}

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

/**
 * 
 * @param {*} classTeam 
 * @param {*} group 
 * @param {*} value 
 */
function buildJson (classTeam, group, value) {
	//console.log('0'.repeat(2-group.length), group.length);

	const range = group * 1 <= 10 ? `${linkRangeSituation[classTeam] ? '0' : ''}1a10` : '11a20';
	
	const url = `https://industrial.api.ubidots.com/api/v1.6/devices/simulador-t${classTeam}-${range}`;
	const json = groupZeroSituation[classTeam] ? `{"grupo${'0'.repeat(2-group.toString().length)}${group}":${value}}` : `{"grupo${group}":${value}}`;

	return {url: url, json: json}
}

/**
 * Requests Ubidots API.
 * @param {number|string} classTeam 
 * @param {number|string} group 
 * @param {number|string} value 
 * @param {function} callback 
 * @returns {object} [XMLHttpRequest object]
 */
function requester (classTeam, group, value, callback) {
	const Http = new XMLHttpRequest();
	
	const token = tokens[classTeam];
	const {url, json} = buildJson(classTeam, group, value);
	
	Http.open("POST", url);
	
	Http.setRequestHeader("X-Auth-Token", token);
	Http.setRequestHeader("Content-Type", "application/json");
	
	Http.onload = callback ? () => {
		const printStyle = 'background: #222; color: #bada55'
		const toPrint = [
			`Json: ${json}`,
			`Turma: <${classTeam}>`, 
			`Grupo: <${group}>`, 
			`Value: <${value}>`, 
			`url: ${url}`,
		];	
		console.log(`%c\n${toPrint.join('\n')}\n\n`, printStyle);
		callback(Http, classTeam, group, value);
	} : () => {
		console.log(Http.responseText);
		Http.responseText.includes("201") ? console.log('Deu certo') : console.log('Deu errado');
		console.log(Http);
	}
	
	Http.send(json);
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

	const createObjToSpecifyTargets = (specificCommand) => {
		const objTargets = {};
		// Regex down => https://regex101.com/r/ytXktR/1
		const classTeamTargets = specificCommand.matchAll(/(\d+)\(\s*((?:(?:(?:\d+\s*\-\s*\d+)|(?:\d+))\,?\s*)+)\)/g);

		for (let classTeamTarget of classTeamTargets) {
			// Regex down => https://regex101.com/r/q9Vr09/1
			const groupRanges = classTeamTarget[2].matchAll(/(?:(\d+)\s*\-\s*(\d+))|(?:(\d+))/g);

			const groupRangesList = [];
			for (let groupRange of groupRanges) {
				if (groupRange[1] && groupRange[2]){
					groupRangesList.push({min: groupRange[1], max: groupRange[2]});
				} else {
					groupRangesList.push({min: groupRange[0], max: groupRange[0]});
				}
			}
			objTargets[classTeamTarget[1]] = groupRangesList;
		}

		return objTargets;
	}
	const specificCommand = $('#precise-explode').val()
	const specific = specificCommand ? createObjToSpecifyTargets(specificCommand) : null
	const isClassAndGroupWithingSpecifiedTargets = (classTeam, group) => {
		if (!Object.keys(specific).includes(classTeam.toString())) {
			return {
				classTeam: Object.keys(specific).map(parseInt).sort((a,b) => a - b)[0], 
				group: 1
			};
		}
		const isRangeGroupValid = specific[classTeam].some(range => {
			if (range.min <= group && group <= range.max) {
				return true;
			}
			return false;
		});
		if (!isRangeGroupValid) {
			return {
				classTeam: classTeam,
				group: specific[classTeam]
					.map(range => parseInt(range.min))
					.filter(minRange => minRange > group)
					.sort((a,b) => a - b)[0]
			};
		}
		return false;
	}
	isClassAndGroupWithingSpecifiedTargets.bind(specific);

	const timing = $('#timing-explode').val() * 1 || 500;
	const val = $('#val-explode').val() * 1 ?? randomNumberValid()
	const $attacList__container = $(`
		<li class="attac-list__container">
			<mark>Inicializando Destruição.. (Destruição em cerca de ${4*20*timing/1000} segundos)</mark>
		</li>
	`);
	const $attacList = $('<ul class="attac-list"></ul>');
	$($attacList__container).append($attacList);
	$('#resultados').append($attacList__container);
	
	const id = setInterval(() => {
		if (group > 20) {
			classTeam++;
			group = 1;
		}
		if (classTeam > 24) {
			console.log('Finalizado!');
			clearInterval(id);
			return null;
		}
		const isClassAndGroupWithingSpecifiedTargetsResult = isClassAndGroupWithingSpecifiedTargets(classTeam, group);
		if (isClassAndGroupWithingSpecifiedTargetsResult) {
			classTeam = isClassAndGroupWithingSpecifiedTargetsResult.classTeam;
			group = isClassAndGroupWithingSpecifiedTargetsResult.group;
			if (group == undefined) {
				console.log('Finalizado!');
				clearInterval(id);
			}
			return null;
		}

		requester(classTeam, group, val, (Http, turma, group, val) => {
			if (Http.responseText.includes("201")) {
				$attacList.append($(`<li class="right">Deu certo - Turma: ${turma}, Grupo: ${group}, Valor: ${val};</li>`));
			} else {
				$attacList.append($(`<li class="wrong">Deu erro - Turma: ${turma}, Grupo: ${group}, Valor: ${val};</li>`));
			}
		})
		group++;
	}, timing);
})