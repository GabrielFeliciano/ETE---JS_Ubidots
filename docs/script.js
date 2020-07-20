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

  const grupoFixed = grupo.toString().length == 1 ? '0' + grupo : grupo
  const dado = `{"grupo${grupo}":${value}}`;

  Http.open("POST", url);

  Http.setRequestHeader("X-Auth-Token", token);
  Http.setRequestHeader("Content-Type", "application/json");
  
  Http.onload = callback ? () => {
    console.log(`Turma: ${turma}, Grupo: ${grupo}, Value: ${value}, url: ${url}`);
    callback(Http);
  } : () => {
    console.log(Http.responseText);
    Http.responseText.includes("201") ? console.log('Deu certo') : console.log('Deu errado');
    console.log(Http);
  }

  Http.send(dado);
}

$('#send').click(function () {
  const turma = $('select#turma').val();
  const grupo = $('select#grupo').val();
  const temp = $("#temperatura").val();
  requester (turma, grupo, temp);
});

$('#explode').click(function () {
  // for (let turma = 21; turma <= 24; turma++) {
  //   for (let group = 1; group <= 20; group++) {

  //   }
  // }
  console.warn('Inicializando Destruição..')
  let turma = 21;
  let group = 1;
  const timing = $('#timing-explode').val() * 1 || 500;
  const val = $('#val-explode').val() * 1 || (() => (Math.random() * 100).toFixed(2))

  const id = setInterval(() => {
    if (turma > 24) {
      console.log('Finalizado!');
      clearInterval(id);
      return null;
    }
    if (group <= 20) {
      requester(turma, group, typeof val == 'function' ? val() : val, Http => {
        Http.responseText.includes("201") ? console.log('Deu certo') : console.log('Deu errado');
      })
      group++;
    } else {
      turma++;
      group = 1;
    }
  }, timing);
})