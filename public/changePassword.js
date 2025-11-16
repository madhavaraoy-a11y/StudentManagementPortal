const form = document.getElementById("changeForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
	e.preventDefault();

	const key = document.getElementById("key").value.trim();
	const newPassword = document.getElementById("newPassword").value.trim();
	const confirmPassword = document
		.getElementById("confirmPassword")
		.value.trim();

	if (newPassword !== confirmPassword) {
		message.textContent = "❌ Passwords do not match!";
		message.style.color = "#dc2626";
		return;
	}

	if (newPassword.length < 6) {
		message.textContent = "⚠️ Password must be at least 6 characters long.";
		message.style.color = "#f59e0b";
		return;
	}

	try {
		const res = await fetch("/api/admin/change-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ key, newPassword }),
		});

		const data = await res.json();

		if (!res.ok) {
			message.textContent = data.message || "❌ Failed to change password.";
			message.style.color = "#dc2626";
			return;
		}

		message.textContent = data.message;
		message.style.color = "#059669";
		form.reset();
	} catch (err) {
		console.error(err);
		message.textContent = "❌ Server error. Try again later.";
		message.style.color = "#dc2626";
	}
});
