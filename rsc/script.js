/**
 * Author: 	Josh Ibad
 * Contact: joshcibad@gmail.com
 * Project: Portfolio Website
 * Version: v0.0.02 (2020-Dec-14)
 * Filename: rsc/script.js
 * Description: Main javascript file used by almost all pages in the website.
 */


/**
 *	Toggles the visibility of the navigation bar/menu.
 */
function showMenuBar(){
	if(document.getElementById("hor-nav-bar").style.visibility == "hidden"){
		document.getElementById("hor-nav-bar").style.visibility = "visible";
	}else{
		document.getElementById("hor-nav-bar").style.visibility = "hidden";
	}
}