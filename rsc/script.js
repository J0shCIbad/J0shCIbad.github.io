/**
 * Author: 	Josh Ibad
 * Contact: joshcibad@gmail.com
 * Project: Portfolio Website
 * Version: v0.0.02 (2020-Dec-14)
 * Filename: rsc/script.js
 * Description: Main javascript file used by almost all pages in the website.
 */

/**
 * Generates the navigation bar
 */
function generateNavBar(opt){
	var tmp_navBar = document.getElementById("hor-nav-bar");
	tmp_navBar.insertAdjacentHTML("afterbegin", 
		"<ul>\n" + 
			"<li><a" + (opt===0 ? ' class="active" ' : " ") + 'href="/">Home</a></li>\n' +
			"<li><a" + (opt===1 ? ' class="active" ' : " ") + 'href="/projects/">Projects</a></li>\n' +
			"<li><a" + (opt===2 ? ' class="active" ' : " ") + 'href="/article/">Articles</a></li>\n' +
			"<li><a" + (opt===3 ? ' class="active" ' : " ") + 'href="/tools/">Tools</a></li>\n' +
			"<li><a" + (opt===4 ? ' class="active" ' : " ") + 'href="/contactme.html">Contact Me</a></li>\n' +
		"</ul>\n"
	);
}

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