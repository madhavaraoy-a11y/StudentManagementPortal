const form = document.getElementById("studentForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
	e.preventDefault();

	const roll = document.getElementById("roll").value.trim();
	const name = document.getElementById("name").value.trim();
	const father = document.getElementById("father").value.trim();
	const aadhar = document.getElementById("aadhar").value.trim();
	const dob = document.getElementById("dob").value.trim();
	const studentClass = document.getElementById("class").value.trim();
	const mobile = document.getElementById("mobile").value.trim();
	const pen = document.getElementById("pen").value.trim();
	const apaar = document.getElementById("apaar").value.trim();
	const year = document.getElementById("year").value.trim();

	if (!/^[0-9]{12}$/.test(aadhar)) {
		alert("Aadhar number must be exactly 12 digits.");
		return;
	}
	if (!/^[0-9]{11}$/.test(pen)) {
		alert("PEN ID must be exactly 11 digits.");
		return;
	}
	if (!/^[A-Za-z0-9]{12}$/.test(apaar)) {
		alert("APAAR ID must be exactly 12 alphanumeric characters.");
		return;
	}

	try {
		const res = await fetch("/api/students", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				roll,
				name,
				father,
				aadhar,
				dob,
				class: studentClass,
				mobile,
				pen,
				apaar,
				year,
			}),
		});

		const data = await res.json();

		if (!res.ok) {
			message.textContent = data.message || "Failed to add student";
			message.style.color = "#dc2626";
			return;
		}

		message.textContent = data.message || "✅ Student added successfully!";
		message.style.color = "#059669";
		form.reset();
	} catch (err) {
		console.error(err);
		message.textContent = "❌ Server error. Please try again.";
		message.style.color = "#dc2626";
	}
});
