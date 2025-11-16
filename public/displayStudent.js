const searchForm = document.getElementById("searchForm");
const studentDetails = document.getElementById("studentDetails");
const message = document.getElementById("message");

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
		const found = await res.json();

		if (!res.ok) {
			message.textContent = found.message || "❌ Student not found!";
			message.style.color = "#dc2626";
			studentDetails.style.display = "none";
			return;
		}

		message.textContent = "";
		message.style.color = "";

		let detailsHTML = `
      <h2 class="center" style="margin-bottom:15px;">Student Information</h2>
      <table class="details-table">
        <tbody>
          <tr><th>Admission No</th><td>${found.roll || "-"}</td></tr>
          <tr><th>Student Name</th><td>${found.name || "-"}</td></tr>
          <tr><th>Father/Guardian Name</th><td>${found.father || "-"}</td></tr>
          <tr><th>Student Aadhar No</th><td>${found.aadhar || "-"}</td></tr>
          <tr><th>Student DOB</th><td>${found.dob || "-"}</td></tr>
          <tr><th>Class</th><td>${found.class || "-"}</td></tr>
          <tr><th>Academic Year</th><td>${found.year || "-"}</td></tr>
          <tr><th>Parent Mobile No</th><td>${found.mobile || "-"}</td></tr>
          <tr><th>PEN ID</th><td>${found.pen || "-"}</td></tr>
          <tr><th>APAAR ID</th><td>${found.apaar || "-"}</td></tr>
        </tbody>
      </table>
    `;

		studentDetails.style.display = "block";
		studentDetails.innerHTML = detailsHTML;
	} catch (err) {
		console.error(err);
		message.textContent = "❌ Server error while searching student";
		message.style.color = "#dc2626";
		studentDetails.style.display = "none";
	}
});
