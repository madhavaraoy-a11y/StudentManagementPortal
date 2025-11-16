const form = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");

form.addEventListener("submit", async (e) => {
	e.preventDefault();

	const username = document.getElementById("username").value.trim();
	const password = document.getElementById("password").value.trim();

	try {
		const res = await fetch("/api/admin/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, password }),
		});

		const data = await res.json();

		if (!res.ok) {
			message.style.color = "#dc2626";
			message.textContent = data.message || "❌ Invalid credentials!";
			return;
		}

		message.style.color = "#059669";
		message.textContent = "✅ Login successful! Redirecting...";
		localStorage.setItem("loggedIn", "true");

		setTimeout(() => {
			window.location.href = "dashboard.html";
		}, 1000);
	} catch (err) {
		console.error(err);
		message.style.color = "#dc2626";
		message.textContent = "❌ Server error, please try again!";
	}
});
