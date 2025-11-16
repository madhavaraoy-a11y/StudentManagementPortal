const searchForm = document.getElementById("searchForm");
const resultDiv = document.getElementById("result");
const marksTable = document.getElementById("marksTable");
const attendanceTable = document.getElementById("attendanceTable");
const message = document.getElementById("message");

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
		const found = await res.json();

		if (!res.ok) {
			resultDiv.style.display = "none";
			message.textContent = found.message || "❌ Student not found!";
			message.style.color = "#dc2626";
			return;
		}

		message.textContent = "";
		resultDiv.style.display = "block";

		const studentHeader = `
      <div class="center" style="margin-bottom:20px;">
        <h2 style="color:#3730a3;">${found.name}</h2>
        <p style="color:#374151; font-weight:500;">
          Admission No: ${found.roll} | Class: ${
			found.class
		} | Academic Year: ${found.year || "-"}
        </p>
      </div>
    `;

		// Marks
		if (!found.marks || Object.keys(found.marks).length === 0) {
			marksTable.innerHTML =
				studentHeader +
				"<p style='text-align:center;color:#374151;'>ℹ️ No marks found.</p>";
		} else {
			const exams = ["FA1", "FA2", "SA1", "FA3", "FA4", "SA2"];
			const subjects = [
				"Telugu",
				"Hindi",
				"English",
				"Maths",
				"Science",
				"Social",
			];

			const examTotals = {};
			const examMaxTotals = {};

			exams.forEach((exam) => {
				examTotals[exam] = 0;
				examMaxTotals[exam] = ["FA1", "FA2", "FA3", "FA4"].includes(exam)
					? subjects.length * 50
					: subjects.length * 100;
			});

			let tableHTML = `
        ${studentHeader}
        <table class="marks-table">
          <thead>
            <tr>
              <th>Subject</th>
              ${exams.map((exam) => `<th>${exam}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
      `;

			subjects.forEach((sub) => {
				const subMarks = (found.marks && found.marks[sub]) || {};
				tableHTML += `
          <tr>
            <td>${sub}</td>
            ${exams
							.map((exam) => {
								const mark =
									subMarks[exam] !== undefined ? parseInt(subMarks[exam]) : "-";
								if (mark !== "-") examTotals[exam] += mark;
								return `<td>${mark}</td>`;
							})
							.join("")}
          </tr>
        `;
			});

			tableHTML += `
          <tr style="background-color:#eef2ff;font-weight:600;">
            <td>Total Marks</td>
            ${exams.map((exam) => `<td>${examTotals[exam]}</td>`).join("")}
          </tr>
          <tr style="background-color:#e0e7ff;font-weight:600;">
            <td>Percentage</td>
            ${exams
							.map((exam) => {
								const percent = (
									(examTotals[exam] / examMaxTotals[exam]) *
									100
								).toFixed(2);
								return `<td>${percent}%</td>`;
							})
							.join("")}
          </tr>
        </tbody>
        </table>
      `;

			marksTable.innerHTML = tableHTML;
		}

		// Attendance
		if (found.attendance && Object.keys(found.attendance).length > 0) {
			let attHTML = `
        ${studentHeader}
        <table class="marks-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Days Present</th>
              <th>Total Days</th>
              <th>Attendance %</th>
            </tr>
          </thead>
          <tbody>
      `;

			for (const month in found.attendance) {
				const att = found.attendance[month];
				const percent = ((att.daysPresent / att.totalDays) * 100).toFixed(1);
				attHTML += `
          <tr>
            <td>${month}</td>
            <td>${att.daysPresent}</td>
            <td>${att.totalDays}</td>
            <td>${percent}%</td>
          </tr>
        `;
			}

			attHTML += `</tbody></table>`;
			attendanceTable.innerHTML = attHTML;
		} else {
			attendanceTable.innerHTML =
				studentHeader +
				"<p style='text-align:center;color:#374151;'>ℹ️ No attendance data found.</p>";
		}
	} catch (err) {
		console.error(err);
		resultDiv.style.display = "none";
		message.textContent = "❌ Server error while searching student";
		message.style.color = "#dc2626";
	}
});
