let App = document.getElementById("app")

function StatusRender(render){

	if(render=="login"){
		
		Login("app")

	}

	if(render=="dasboard"){

		Dasboard("app")
	}
}

StatusRender("login")