const searchForm = document.getElementById("searchForm");
const marksSection = document.getElementById("marksSection");
const studentName = document.getElementById("studentName");
const marksForm = document.getElementById("marksForm");
const message = document.getElementById("message");
let currentStudent = null;

searchForm.addEventListener("submit", async (e) => {
	e.preventDefault();
	const roll = document.getElementById("roll").value.trim();
	const studentClass = document.getElementById("class").value.trim();

	try {
		const res = await fetch(
			`/api/students?roll=${encodeURIComponent(
				roll
			)}&class=${encodeURIComponent(studentClass)}`
		);
		const data = await res.json();

		if (!res.ok) {
			marksSection.style.display = "none";
			message.textContent = data.message || "❌ Student not found!";
			message.style.color = "#dc2626";
			return;
		}

		currentStudent = data;
		marksSection.style.display = "block";
		studentName.textContent = `Student: ${data.name} (${data.class}, ${data.year})`;
		message.textContent = "";
	} catch (err) {
		console.error(err);
		marksSection.style.display = "none";
		message.textContent = "❌ Server error while searching student";
		message.style.color = "#dc2626";
	}
});

document.getElementById("exam").addEventListener("change", () => {
	const exam = document.getElementById("exam").value;
	const marksInput = document.getElementById("marks");

	if (["FA1", "FA2", "FA3", "FA4"].includes(exam)) {
		marksInput.max = 50;
		marksInput.placeholder = "Max: 50";
	} else {
		marksInput.max = 100;
		marksInput.placeholder = "Max: 100";
	}
});

marksForm.addEventListener("submit", async (e) => {
	e.preventDefault();
	if (!currentStudent) return;

	const subject = document.getElementById("subject").value;
	const exam = document.getElementById("exam").value;
	const marks = parseInt(document.getElementById("marks").value);

	if (["FA1", "FA2", "FA3", "FA4"].includes(exam) && marks > 50) {
		alert("Marks for " + exam + " should not exceed 50!");
		return;
	}
	if (["SA1", "SA2"].includes(exam) && marks > 100) {
		alert("Marks for " + exam + " should not exceed 100!");
		return;
	}

	try {
		const res = await fetch("/api/students/marks", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				roll: currentStudent.roll,
				class: currentStudent.class,
				year: currentStudent.year,
				subject,
				exam,
				marks,
			}),
		});

		const data = await res.json();

		if (!res.ok) {
			message.textContent = data.message || "❌ Failed to save marks";
			message.style.color = "#dc2626";
			return;
		}

		message.textContent = data.message || "✅ Marks saved successfully!";
		message.style.color = "#059669";
		marksForm.reset();
	} catch (err) {
		console.error(err);
		message.textContent = "❌ Server error while saving marks";
		message.style.color = "#dc2626";
	}
});
