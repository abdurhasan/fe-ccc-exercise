// ================ 1 :  Set global variable


const BASE_URL = 'http://localhost:3000/ccc-services'
let mainData = new Array;
let selectedData = new Array;

const limit = 5;
let skip = 0;
let currentPage = 0; // Index of Pages , start from 0 
let totalPage = 0;	 // Total of Pages , depends on jumlah data 
let jumlahData = 0;

// ================== Main Func ==================
function mainFunc() {
	return axios.get(BASE_URL + `?skip=${skip}&limit=${limit}`)
		.then(snap => {
			mainData = snap.data.Moduledoc;
			jumlahData = snap.data.Moduletotal;
			totalPage = Math.ceil(snap.data.Moduletotal / limit);

			renderData();
			renderPage()
		})
}

// ================== Renderer Funcs ==================
function renderData() {
	$("#moduleTable").empty()
	mainData.map((snap, index) => {
		$("#moduleTable").append(`
		<tr id="${snap._id}">                     
			<td>${index + skip + 1}</td>
			<td>${snap.service_name}</td>
			<td>${snap.description}</td>
			<td>${snap.urlrepo}</td>
			<td>${snap.developers}</td>
			<td>
				<a href="#moduleModal" class="edit" data-toggle="modal">
					<i class="material-icons" onclick="renderModal('Edit','${snap._id}')" data-toggle="tooltip" title="Edit">&#xE254;</i>
				</a>
				<a href="#moduleModal" class="delete" data-toggle="modal">
					<i class="material-icons" onclick="renderModal('Delete','${snap._id}')" data-toggle="tooltip" title="Delete">&#xE872;</i>
				</a>
			</td>
		</tr>
		`);
	})
}

function renderPage() {
	$('#totalPage').text(jumlahData);

	$("#pagination > li").empty()
	$("#pagination").append(`<li class="page-item ${currentPage == 0 ? 'disabled' : ''}"><a href="#" data-id="previous" >Previous</a></li>`)

	for (let index = 0; index < totalPage; index++) {
		$("#pagination").append(`<li class="page-item ${index === currentPage ? 'active' : ''}"><a href="#" data-id="${index}" >${index + 1}</a></li>`)
	}

	$("#pagination").append(`<li class="page-item ${currentPage == totalPage - 1 ? 'disabled' : ''}"><a href="#" data-id="next" >Next</a></li>`)
}

function renderModal(title, datum) {
	let localDatum = mainData.filter(res => res._id === datum)[0];
	if (!localDatum) localDatum = Object.keys(mainData[0]).reduce((a, key) => Object.assign(a, { [key]: '' }), {});
	localDatum['title'] = title;



	$('#mainModal').empty().append(`
	<div class="modal-header">
    <h4 class="modal-title">${localDatum.title} Module</h4>
    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
</div>
	${modalBody(localDatum)}

<div class="modal-footer">
    <input type="button" class="btn btn-default" data-dismiss="modal" value="Cancel">
    <input type="submit" class="btn btn-${libOrder(title) == 'delete' ? 'danger' : 'success'}" value="${title}">
</div>
	`)

	$('#mainModal').removeData().attr('data-command', title);
	$('#mainModal').removeData().attr('data-id', localDatum._id);

}

// Main proccess
try {

	mainFunc() // Initial Rendering

	// CRUD Process : Add , Edit , Delete
	$("#mainModal").submit(event => {
		event.preventDefault();
		const Target = event.target;
		const API_REQUEST = axios[libOrder($(Target).data("command"))];
		const PARAM_ID = $(Target).data("id") ? `/${$(Target).data("id")}` : ''


		let stateData = new Object;  // Object data to request

		for (let i = 0; i < Target.length - 1; i++) {
			if (Target[i].name) {
				stateData[Target[i].name] = Target[i].value
			}
		}

		API_REQUEST(BASE_URL + PARAM_ID, stateData)
			.then(res => {
				$(".modal").modal('toggle');
				mainFunc()
			})


	})

	// Pagination Process
	$("#pagination").on("click", "li:not(.disabled)", (el) => {
		el.preventDefault();
		const $this = $(el.target)
		const $id = $this.data("id")

		switch ($id) {
			case currentPage:
				break;

			case 'next':
				currentPage = currentPage + 1;
				break;

			case 'previous':
				currentPage = currentPage - 1;
				break;
			default:
				currentPage = $id
				break;
		}

		skip = currentPage * limit
		mainFunc()
	});

} catch (error) {
	window.location.reload()
}










// ================== Helper Funcs
function libOrder(ord) {
	//Convert order be axios command
	const dir = {
		'put': 'put',
		'edit': 'put',
		'add': 'post',
		'post': 'post',
		'delete': 'delete',
		'del': 'delete'

	}
	return dir[ord.toLowerCase()]
}

function modalBody(localDatum) {

	return libOrder(localDatum.title) == 'delete' ?
		`
	<div class="modal-body">
		<p>Are you sure you want to delete these Records?</p>
		<p class="text-warning"><small>This action cannot be undone.</small></p>
    </div>
	`
		:
		`
	<div class="modal-body">
	<div class="form-group">
		<label>Service Name</label>
		<input type="text" name="service_name" value="${localDatum.service_name}" class="form-control">
	</div>
	<div class="form-group">
		<label>description</label>
		<textarea class="form-control" name="description">${localDatum.description}</textarea>
	</div>
	<div class="form-group">
		<label>URL Repo</label>
		<input type="text" class="form-control" name="urlrepo" value="${localDatum.urlrepo}">
	</div>
	<div class="form-group">
		<label>Developers</label>
		<input type="text" class="form-control" name="developers" value="${localDatum.developers}">
	</div>
</div>
	`


}