const form = document.getElementById("promoteForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
	e.preventDefault();

	const roll = document.getElementById("roll").value.trim();
	const cls = document.getElementById("class").value.trim();
	const year = document.getElementById("year").value.trim();
	const newClass = document.getElementById("newClass").value.trim();
	const newYear = document.getElementById("newYear").value.trim();

	try {
		const res = await fetch("/api/students/promote", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				roll,
				fromClass: cls,
				fromYear: year,
				toClass: newClass,
				toYear: newYear,
			}),
		});

		const data = await res.json();

		if (!res.ok) {
			message.textContent = data.message || "❌ Failed to promote student";
			message.style.color = "#dc2626";
			return;
		}

		message.textContent = data.message;
		message.style.color = "#059669";
		form.reset();
	} catch (err) {
		console.error(err);
		message.textContent = "❌ Server error while promoting student";
		message.style.color = "#dc2626";
	}
});
