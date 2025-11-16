if (localStorage.getItem("loggedIn") !== "true") {
	alert("Please log in to access the admin dashboard!");
	window.location.href = "login.html";
}

document.getElementById("logoutBtn").addEventListener("click", () => {
	localStorage.removeItem("loggedIn");
	alert("Logged out successfully!");
	window.location.href = "index.html";
});
