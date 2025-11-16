const searchForm = document.getElementById("searchForm");
const editSection = document.getElementById("editSection");
const editForm = document.getElementById("editForm");
const message = document.getElementById("message");

let currentStudent = null;

searchForm.addEventListener("submit", async (e) => {
	e.preventDefault();

	const roll = document.getElementById("roll").value.trim();
	const cls = document.getElementById("class").value.trim();

	try {
		const res = await fetch(
			`/api/students?roll=${encodeURIComponent(
				roll
			)}&class=${encodeURIComponent(cls)}`
		);
		const data = await res.json();

		if (!res.ok) {
			editSection.style.display = "none";
			message.textContent = data.message || "❌ Student not found!";
			message.style.color = "#dc2626";
			return;
		}

		currentStudent = data;
		message.textContent = "";
		editSection.style.display = "block";

		document.getElementById("name").value = data.name || "";
		document.getElementById("father").value = data.father || "";
		document.getElementById("aadhar").value = data.aadhar || "";
		document.getElementById("dob").value = data.dob || "";
		document.getElementById("mobile").value = data.mobile || "";
		document.getElementById("pen").value = data.pen || "";
		document.getElementById("apaar").value = data.apaar || "";
	} catch (err) {
		console.error(err);
		editSection.style.display = "none";
		message.textContent = "❌ Server error while searching student";
		message.style.color = "#dc2626";
	}
});

editForm.addEventListener("submit", async (e) => {
	e.preventDefault();
	if (!currentStudent) return;

	const updatedStudent = {
		roll: currentStudent.roll,
		class: currentStudent.class,
		year: currentStudent.year,
		name: document.getElementById("name").value.trim(),
		father: document.getElementById("father").value.trim(),
		aadhar: document.getElementById("aadhar").value.trim(),
		dob: document.getElementById("dob").value.trim(),
		mobile: document.getElementById("mobile").value.trim(),
		pen: document.getElementById("pen").value.trim(),
		apaar: document.getElementById("apaar").value.trim(),
	};

	if (!/^[0-9]{12}$/.test(updatedStudent.aadhar)) {
		alert("Aadhar number must be exactly 12 digits.");
		return;
	}
	if (!/^[0-9]{11}$/.test(updatedStudent.pen)) {
		alert("PEN ID must be exactly 11 digits.");
		return;
	}
	if (!/^[A-Za-z0-9]{12}$/.test(updatedStudent.apaar)) {
		alert("APAAR ID must be exactly 12 alphanumeric characters.");
		return;
	}

	try {
		const res = await fetch("/api/students", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(updatedStudent),
		});

		const data = await res.json();

		if (!res.ok) {
			message.textContent = data.message || "❌ Failed to update student";
			message.style.color = "#dc2626";
			return;
		}

		message.textContent =
			data.message || "✅ Student details updated successfully!";
		message.style.color = "#059669";
	} catch (err) {
		console.error(err);
		message.textContent = "❌ Server error while updating student";
		message.style.color = "#dc2626";
	}
});
