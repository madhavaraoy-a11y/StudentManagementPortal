// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve all frontend files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

// ✅ MongoDB Connection
const MONGO_URI =
	"mongodb+srv://madhavaraoy_db_user:zBJlsTqkAcsbZCEX@cluster0.aljmybe.mongodb.net/studentDB?appName=Cluster0";
mongoose
	.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log("✅ Connected to MongoDB"))
	.catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 🎓 Student Schema
const studentSchema = new mongoose.Schema({
	roll: { type: String, required: true },
	name: { type: String, required: true },
	father: { type: String, required: true },
	aadhar: { type: String, required: true },
	dob: { type: String, required: true },
	class: { type: String, required: true },
	mobile: { type: String, required: true },
	pen: { type: String, required: true },
	apaar: { type: String, required: true },
	year: { type: String, required: true },
	marks: { type: Object, default: {} },
	attendance: { type: Object, default: {} },
});

const Student = mongoose.model("Student", studentSchema);

// 🧑‍💼 Admin Schema
const adminSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	secretKey: { type: String, required: true },
});

const Admin = mongoose.model("Admin", adminSchema);

// 🌱 Default Admin
(async () => {
	const existing = await Admin.findOne({ username: "admin" });
	if (!existing) {
		await Admin.create({
			username: "admin",
			password: "admin123",
			secretKey: "superkey123",
		});
		console.log("✅ Default admin created (user: admin / pass: admin123)");
	}
})();

/* ----------------------- ADMIN ROUTES ----------------------- */

// 🔑 Login
app.post("/api/admin/login", async (req, res) => {
	try {
		const { username, password } = req.body;
		const admin = await Admin.findOne({ username });
		if (!admin || admin.password !== password) {
			return res.status(401).json({ message: "Invalid username or password" });
		}
		res.json({ message: "Login successful" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error during login" });
	}
});

// 🔐 Change Password
app.post("/api/admin/change-password", async (req, res) => {
	try {
		const { key, newPassword } = req.body;
		const admin = await Admin.findOne({ secretKey: key });
		if (!admin) {
			return res.status(403).json({ message: "❌ Invalid secret key" });
		}

		admin.password = newPassword;
		await admin.save();

		res.json({ message: "✅ Password changed successfully!" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error while changing password" });
	}
});

/* ----------------------- STUDENT ROUTES ----------------------- */

// ➕ Add Student
app.post("/api/students", async (req, res) => {
	try {
		const {
			roll,
			name,
			father,
			aadhar,
			dob,
			class: cls,
			mobile,
			pen,
			apaar,
			year,
		} = req.body;

		const existing = await Student.findOne({
			$or: [{ roll, class: cls, year }, { aadhar }, { pen }, { apaar }],
		});

		if (existing) {
			return res
				.status(400)
				.json({ message: "Student with same details already exists!" });
		}

		const student = new Student({
			roll,
			name,
			father,
			aadhar,
			dob,
			class: cls,
			mobile,
			pen,
			apaar,
			year,
		});

		await student.save();
		res.status(201).json({ message: "✅ Student added successfully!" });
	} catch (error) {
		console.error("Add student error:", error);
		res.status(500).json({ error: "Server error while adding student" });
	}
});

// 🔍 Get Student
app.get("/api/students", async (req, res) => {
	try {
		const { roll, class: cls, year } = req.query;
		if (!roll || !cls)
			return res.status(400).json({ message: "roll & class required" });

		const query = { roll, class: cls };
		if (year) query.year = year;

		const student = await Student.findOne(query);
		if (!student) return res.status(404).json({ message: "Student not found" });

		res.json(student);
	} catch (error) {
		res.status(500).json({ message: "Server error while fetching student" });
	}
});

/* ----------------------- FRONTEND FALLBACK ----------------------- */

// ✅ This ensures all pages in /public load correctly
app.use((req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* --------------------------------------------------------------- */

const PORT = 5000;
app.listen(PORT, () =>
	console.log(`🚀 Server running on http://localhost:${PORT}`)
);
