const header = document.querySelector('header');
const btnExportSetup = header.querySelectorAll('button')[0];
const btnImportSetup = header.querySelectorAll('button')[1];
const btnDownloadSetup = header.querySelector('a.downloadSetup');
const btnDeleteSetup = header.querySelectorAll('button')[3];
const btnAddPiece= header.querySelectorAll('button')[4];
const inputSearchPieces = document.getElementById('search-pieces');
const table = document.querySelector('table');
const tbody = table.querySelector('tbody');
const totalValorOfSetupElement = document.getElementById('totalValorOfSetup');

function exportSetup() {
	const setup = getSetup();

  btnDownloadSetup.href = createJsonFile(setup);
  btnDownloadSetup.classList.remove('downloadSetup');
  btnDownloadSetup.download = 'Meu Setup.json';
}

function importSetup() {
	document.getElementById('setupJsonFile').click();
}

function getSetup() {
	return window.localStorage.getItem('mySetup');
}

function renderSetup() {
	let setupJson = getSetup();
	let totalValorOfSetup = 0;

	if (setupJson != null) {
		setupJson = JSON.parse(setupJson);
		tbody.innerHTML = '';

		setupJson['mySetup'].forEach((item, index) => {
			const pieceName = item[0];
			const storeName = item[1];
			const pieceStatus = item[2];
			const piecePrice = item[3].toLocaleString('pt-br', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });

			tbody.innerHTML += `
				<tr>
		      <td data-label="Nome">${pieceName}</td>
		      <td data-label="Loja" translate="no">${storeName}</td>
		      <td data-label="Status">${pieceStatus}</td>
		      <td data-label="Preço">${piecePrice}</td>
		      <td data-label="Ações">
		      	<button class="btn-btn black" data-pieceid="${index}"><i class="fa-solid fa-edit"></i>&nbsp;Editar</button>
		      	<button class="btn-btn black" data-pieceid="${index}"><i class="fa-solid fa-trash-can"></i>&nbsp;Apagar</button>
		      </td>
	    	</tr>
			`;

			totalValorOfSetup += item[3];
			inputSearchPieces.placeholder = index == 0 ? `Procure 1 peça...` : `Procure ${index + 1} peças...`;
		});

		totalValorOfSetupElement.innerText = (totalValorOfSetup.toLocaleString('pt-br', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }));
	} else {
		inputSearchPieces.placeholder = 'Nenhuma peça para procurar...';
	}
}

function deleteSetup() {
  Swal.fire({
    icon: 'warning',
    title: `Você realmente quer apagar todo o seu setup?`,
    footer: 'Não é possível reverter isto!',
    showDenyButton: true,
    confirmButtonText: 'Sim, quero.',
    confirmButtonColor: '#212121',
    denyButtonText: `Não, não quero.`,
    background: '#0f0f0f',
  }).then((result) => {
    if (result.isConfirmed) {
      window.localStorage.removeItem('mySetup');

      Swal.fire({
        icon: 'success',
        text: `Todo o seu setup foi apagado com sucesso!`,
        background: '#0f0f0f',
        confirmButtonColor: '#212121',
      }).then(() => {
      	tbody.innerHTML = '';
        totalValorOfSetupElement.innerText = 'NADA A CALCULAR!';
        inputSearchPieces.placeholder = 'Nenhuma peça para procurar...';
      });
    } else if (result.isDenied) {
      Swal.fire({
        icon: 'info',
        text: `Exclusão cancelada!`,
        background: '#0f0f0f',
        confirmButtonColor: '#212121',
      });
    }
  });
}

async function addPiece() {
  const { value: formValues } = await Swal.fire({
    title: 'Adicionar Peça',
    html:
      `<input style="width: 300px" id="swal-input1" type="text" class="swal2-input" placeholder="Nome da Peça">
      <input style="width: 300px" id="swal-input2" type="text" class="swal2-input" placeholder="Nome da Loja">
      <select class="swal2-select" style="width: 300px" id="swal-input3" style="display: flex; background: #0f0f0f;">
      	<option value="" disabled="" style="background: #0f0f0f;">Selecione uma opção</option>
      	<option value="Novo" style="background: #0f0f0f;">Novo</option>
      	<option value="Semi-Novo" style="background: #0f0f0f;">Semi-Novo</option>
      	<option value="Usado" style="background: #0f0f0f;">Usado</option>
      </select>
      <input style="width: 300px" id="swal-input4" type="number" class="swal2-input" placeholder="Valor da Peça (00,00)">
      `,
    focusConfirm: false,
    background: '#0f0f0f',
    confirmButtonText: 'Adicionar',
    confirmButtonColor: '#212121',
    showCancelButton: true,
    cancelButtonText: 'Cancelar',

    preConfirm: () => {
      return [
        document.getElementById('swal-input1').value,
        document.getElementById('swal-input2').value,
        document.getElementById('swal-input3').value,
        document.getElementById('swal-input4').value
      ]
    }
  });

  if (
  	!empty(document.getElementById('swal-input1').value) &&
  	!empty(document.getElementById('swal-input2').value) &&
  	!empty(document.getElementById('swal-input3').value) &&
  	!empty(document.getElementById('swal-input4').value)
  ) {
  	let setupJson = getSetup();
  	const pieceName = document.getElementById('swal-input1').value.trim();
  	const storeName = document.getElementById('swal-input2').value.trim();
  	const pieceStatus = document.getElementById('swal-input3').value.trim();
  	const piecePrice = parseFloat(document.getElementById('swal-input4').value.trim().replaceAll(',', '.'));
  	const arrayPiece = [pieceName, storeName, pieceStatus, piecePrice];

  	// If not exists a json, will be created.
  	if (setupJson == null) {
  		setupJson = {
  			"mySetup": [
  				arrayPiece
  			]
  		};
  	} else {
  		setupJson = JSON.parse(setupJson);

  		setupJson['mySetup'].push(arrayPiece);
  	}

  	window.localStorage.setItem('mySetup', JSON.stringify(setupJson));

  	Swal.fire({
     	icon: 'success',
     	text: `A peça (${pieceName}) foi adicionada ao seu setup!`,
     	background: '#0f0f0f',
     	confirmButtonColor: '#212121',
   	}).then(() => {
     	renderSetup();
   	});
  }
}

async function editPiece(pieceId) {
	let setupJson = getSetup();

	if (setupJson != null) {
		setupJson = JSON.parse(setupJson);

		for (let i = 0; i < setupJson['mySetup'].length; i++) {
		  if (i == pieceId) {
		    const setupItemToEditJson = setupJson['mySetup'][i];
		    const pieceNameToEdit = setupItemToEditJson[0];
		    const storeNameToEdit = setupItemToEditJson[1];
		    const pieceStatusToEdit = setupItemToEditJson[2];
		    const piecePriceToEdit = setupItemToEditJson[3];
		    let html_options = `
		    	<option value="" disabled="" style="background: #0f0f0f;">Selecione uma opção</option>
		    `;

		    if (pieceStatusToEdit == 'Novo') {
		    	html_options += `
			    	<option value="Novo" style="background: #0f0f0f;" selected>Novo</option>
				    <option value="Semi-Novo" style="background: #0f0f0f;">Semi-Novo</option>
				    <option value="Usado" style="background: #0f0f0f;">Usado</option>
		    	`;
		    } else if (pieceStatusToEdit == 'Semi-Novo') {
		    	html_options += `
			    	<option value="Novo" style="background: #0f0f0f;">Novo</option>
				    <option value="Semi-Novo" style="background: #0f0f0f;" selected>Semi-Novo</option>
				    <option value="Usado" style="background: #0f0f0f;">Usado</option>
		    	`;
		    } else if (pieceStatusToEdit == 'Usado') {
		    	html_options += `
			    	<option value="Novo" style="background: #0f0f0f;">Novo</option>
				    <option value="Semi-Novo" style="background: #0f0f0f;">Semi-Novo</option>
				    <option value="Usado" style="background: #0f0f0f;" selected>Usado</option>
		    	`;
		    }

			  const { value: formValues } = await Swal.fire({
			    title: 'Editar Peça',
			    html:
			      `<input style="width: 300px" id="swal-input1" type="text" class="swal2-input" placeholder="Nome da Peça" value="${pieceNameToEdit}">
			      <input style="width: 300px" id="swal-input2" type="text" class="swal2-input" placeholder="Nome da Loja" value="${storeNameToEdit}">
			      <select class="swal2-select" style="width: 300px" id="swal-input3" style="display: flex; background: #0f0f0f;">
			      	${html_options}
			      </select>
			      <input style="width: 300px" id="swal-input4" type="number" class="swal2-input" placeholder="Valor da Peça (00,00)" value="${piecePriceToEdit}">
			      `,
			    focusConfirm: false,
			    background: '#0f0f0f',
			    confirmButtonText: 'Salvar',
			    confirmButtonColor: '#212121',
			    showCancelButton: true,
			    cancelButtonText: 'Cancelar',

			    preConfirm: () => {
			      return [
			        document.getElementById('swal-input1').value,
			        document.getElementById('swal-input2').value,
			        document.getElementById('swal-input3').value,
			        document.getElementById('swal-input4').value
			      ]
			    }
			  });

			  if (
			  	!empty(document.getElementById('swal-input1').value) &&
			  	!empty(document.getElementById('swal-input2').value) &&
			  	!empty(document.getElementById('swal-input3').value) &&
			  	!empty(document.getElementById('swal-input4').value)
			  ) {
			  	const pieceName = document.getElementById('swal-input1').value.trim();
			  	const storeName = document.getElementById('swal-input2').value.trim();
			  	const pieceStatus = document.getElementById('swal-input3').value.trim();
			  	const piecePrice = parseFloat(document.getElementById('swal-input4').value.trim().replaceAll(',', '.'));

			  	if (
			  		pieceNameToEdit != pieceName ||
			  		storeNameToEdit != storeName ||
			  		pieceStatusToEdit != pieceStatus ||
			  		piecePriceToEdit != piecePrice
			  	) {
			  		const arrayPiece = [pieceName, storeName, pieceStatus, piecePrice];

				  	setupJson['mySetup'][pieceId] = arrayPiece;

				  	window.localStorage.setItem('mySetup', JSON.stringify(setupJson));

				  	Swal.fire({
				  		icon: 'success',
				     	text: `A peça foi editada com sucesso!`,
				     	background: '#0f0f0f',
				     	confirmButtonColor: '#212121',
				   	}).then(() => {
				     	renderSetup();
				   	});
			  	}
			  }

		    break;
		  }
		}
	}
}

function deletePiece(pieceId) {
	let setupJson = getSetup();

	if (setupJson != null) {
		Swal.fire({
			icon: 'question',
			background: '#0f0f0f',
		  title: 'Você realmente quer apagar esta peça?',
		  showDenyButton: true,
		  showCancelButton: true,
		  cancelButtonText: 'Cancelar',
		  confirmButtonText: 'Sim, quero.',
		  confirmButtonColor: '#212121',
		  denyButtonText: `Não, não quero.`,
		}).then((result) => {
		  if (result.isConfirmed) {
		  	setupJson = JSON.parse(setupJson);

				setupJson['mySetup'] = setupJson['mySetup'].filter((item, index) => index != pieceId);

				window.localStorage.setItem('mySetup', JSON.stringify(setupJson));

				if (setupJson['mySetup'].length == 0) {
					tbody.innerHTML = '';
					inputSearchPieces.placeholder = 'Nenhuma peça para procurar...';
					totalValorOfSetupElement.innerText = 'NADA A CALCULAR!';

					window.localStorage.removeItem('mySetup');
				}

				renderSetup();

				Swal.fire({
					icon: 'success',
					background: '#0f0f0f',
				  title: 'Peça apagada com sucesso do seu setup!',
				  confirmButtonColor: '#212121'
				});
		  } else if (result.isDenied) {
		  	Swal.fire({
					icon: 'info',
					background: '#0f0f0f',
				  title: 'Nada foi apagado!',
				  confirmButtonColor: '#212121'
				});
		  }
		});
	}
}

function searchPieces() {
	let quantityPiecesFound = 0;
	const trs = table.querySelectorAll('tr');

	for (let i = 0; i < trs.length; i++) {
		if (i != 0 && i != 1) {
			const pieceName = trs[i].querySelectorAll('td')[0].innerText.toLowerCase();

			if (pieceName.includes(inputSearchPieces.value.toLowerCase())) {
				trs[i].removeAttribute('style');
				quantityPiecesFound++;
			} else {
				trs[i].style.display = 'none';
			}
		}
	}

	if (inputSearchPieces.value.trim() == '') {
		table.querySelector('caption').innerHTML = '<i class="fa-solid fa-microchip"></i>&nbsp;Hardware, Periféricos e Mais...';
		
		return false;
	}

	table.querySelector('caption').innerHTML = '<i class="fa-solid fa-square-poll-vertical"></i>&nbsp;';
	table.querySelector('caption').innerHTML += quantityPiecesFound == 1 ? `${quantityPiecesFound} peça encontrada` : `${quantityPiecesFound} peças encontradas`;
}

function createJsonFile(json) {
  let jsonFile = null;
  const data = new Blob([json], { type: 'application/json' });

  if (jsonFile !== null) {  
    window.URL.revokeObjectURL(jsonFile);  
  }

  jsonFile = window.URL.createObjectURL(data);

  return jsonFile; 
}

function readJsonFile(file) {
  const reader = new FileReader();

  reader.onload = (event) => {
    const data = event.target.result;

    window.localStorage.setItem('mySetup', data);
  };

  reader.readAsText(file[0]);

  window.location.reload();
}

function empty(haystack) {
	return haystack == '' ? true : false;
}

btnImportSetup.addEventListener('click', importSetup);
btnExportSetup.addEventListener('click', exportSetup);
btnDownloadSetup.addEventListener('click', () => {
	btnDownloadSetup.classList.add('downloadSetup');
});
btnAddPiece.addEventListener('click', addPiece);
btnDeleteSetup.addEventListener('click', deleteSetup);
inputSearchPieces.addEventListener('input', searchPieces);

window.addEventListener('DOMContentLoaded', () => {
	renderSetup();
});

$('table').on('click', 'tbody tr td button:first-child', (event) => {
	editPiece(event.target.dataset.pieceid);
});

$('table').on('click', 'tbody tr td button:last-child', (event) => {
	deletePiece(event.target.dataset.pieceid);
});
