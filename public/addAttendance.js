const searchForm = document.getElementById("searchForm");
const attendanceSection = document.getElementById("attendanceSection");
const studentName = document.getElementById("studentName");
const attendanceForm = document.getElementById("attendanceForm");
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
			attendanceSection.style.display = "none";
			message.textContent = data.message || "❌ Student not found!";
			message.style.color = "#dc2626";
			return;
		}

		currentStudent = data;
		attendanceSection.style.display = "block";
		studentName.textContent = `Student: ${data.name} (${data.class}, ${data.year})`;
		message.textContent = "";
	} catch (err) {
		console.error(err);
		attendanceSection.style.display = "none";
		message.textContent = "❌ Server error while searching student";
		message.style.color = "#dc2626";
	}
});

attendanceForm.addEventListener("submit", async (e) => {
	e.preventDefault();
	if (!currentStudent) return;

	const month = document.getElementById("month").value;
	const daysPresent = parseInt(document.getElementById("daysPresent").value);
	const totalDays = parseInt(document.getElementById("totalDays").value);

	if (daysPresent > totalDays) {
		alert("Days present cannot exceed total days!");
		return;
	}

	try {
		const res = await fetch("/api/students/attendance", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				roll: currentStudent.roll,
				class: currentStudent.class,
				year: currentStudent.year,
				month,
				daysPresent,
				totalDays,
			}),
		});

		const data = await res.json();

		if (!res.ok) {
			message.textContent = data.message || "❌ Failed to save attendance";
			message.style.color = "#dc2626";
			return;
		}

		message.textContent = data.message || "✅ Attendance saved successfully!";
		message.style.color = "#059669";
		attendanceForm.reset();
	} catch (err) {
		console.error(err);
		message.textContent = "❌ Server error while saving attendance";
		message.style.color = "#dc2626";
	}
});
