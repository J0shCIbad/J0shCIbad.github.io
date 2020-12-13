var verNavBarVisible = false;

function showMenuBar(){
	if(verNavBarVisible){
		document.getElementById("hor-nav-bar").style.visibility = "hidden";
	}else{
		document.getElementById("hor-nav-bar").style.visibility = "visible";
	}
	verNavBarVisible = !verNavBarVisible;
}