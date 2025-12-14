// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

const MONGO_URI =
  "mongodb+srv://madhavaraoy_db_user:zBJlsTqkAcsbZCEX@cluster0.aljmybe.mongodb.net/studentDB?retryWrites=true&w=majority";

// ---------------------- SCHEMAS ----------------------

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  secretKey: { type: String, required: true },
});

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

const Admin = mongoose.model("Admin", adminSchema);
const Student = mongoose.model("Student", studentSchema);

// ---------------------- DEFAULT ROUTE ----------------------
app.get("/", (req, res) => {
  res.send("Backend Running ✔");
});

// ---------------------- DEFAULT ADMIN ----------------------
async function createDefaultAdmin() {
  const existing = await Admin.findOne({ username: "admin" });
  if (!existing) {
    await Admin.create({
      username: "admin",
      password: "admin123",
      secretKey: "superkey123",
    });
    console.log("Default admin created ✔");
  }
}

// ---------------------- ADMIN ROUTES ----------------------

// Login
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });
  if (!admin || admin.password !== password)
    return res.status(401).json({ message: "Invalid username or password" });

  res.json({ message: "Login successful" });
});

// Change Password
app.post("/api/admin/change-password", async (req, res) => {
  const { key, newPassword } = req.body;

  const admin = await Admin.findOne({ secretKey: key });
  if (!admin) return res.status(403).json({ message: "Invalid secret key" });

  admin.password = newPassword;
  await admin.save();

  res.json({ message: "Password changed successfully" });
});

// ---------------------- STUDENT ROUTES ----------------------

// Add Student
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
      marks,
      attendance,
    } = req.body;

    const exists = await Student.findOne({
      $or: [{ roll, class: cls, year }, { aadhar }, { pen }, { apaar }],
    });

    if (exists)
      return res
        .status(400)
        .json({ message: "Student with same details already exists" });

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
      marks: marks || {},
      attendance: attendance || {},
    });

    await student.save();
    res.json({ message: "Student added successfully" });
  } catch (e) {
    res.status(500).json({ message: "Error adding student" });
  }
});

// Fetch Student
app.get("/api/students", async (req, res) => {
  try {
    const { roll, class: cls, year } = req.query;

    if (!roll || !cls)
      return res.status(400).json({ message: "Roll and Class required" });

    const query = { roll, class: cls };
    if (year) query.year = year;

    const student = await Student.findOne(query);

    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json(student);
  } catch (e) {
    res.status(500).json({ message: "Error fetching student" });
  }
});

// ---------------------- SAVE ATTENDANCE ----------------------
app.patch("/api/students/attendance", async (req, res) => {
  try {
    const { roll, class: cls, year, month, daysPresent, totalDays } = req.body;

    const student = await Student.findOne({ roll, class: cls, year });

    if (!student) return res.status(404).json({ message: "Student not found" });

    if (!student.attendance) student.attendance = {};

    student.attendance[month] = { daysPresent, totalDays };

    // Important to save nested object
    student.markModified("attendance");

    await student.save();

    res.json({ message: "Attendance saved successfully" });
  } catch (e) {
    console.error("Attendance Error:", e);
    res.status(500).json({ message: "Error saving attendance" });
  }
});

// ---------------------- SAVE MARKS ----------------------
app.patch("/api/students/marks", async (req, res) => {
  try {
    const { roll, class: cls, year, subject, exam, marks } = req.body;

    const student = await Student.findOne({ roll, class: cls, year });

    if (!student) return res.status(404).json({ message: "Student not found" });

    if (!student.marks) student.marks = {};
    if (!student.marks[subject]) student.marks[subject] = {};

    student.marks[subject][exam] = marks;

    student.markModified("marks");

    await student.save();

    res.json({ message: "Marks saved successfully" });
  } catch (e) {
    console.error("Marks Error:", e);
    res.status(500).json({ message: "Error saving marks" });
  }
});
// ---------------------- UPDATE STUDENT ----------------------
app.put("/api/students", async (req, res) => {
  try {
    const {
      roll,
      class: cls,
      year,
      name,
      father,
      aadhar,
      dob,
      mobile,
      pen,
      apaar,
    } = req.body;

    const student = await Student.findOne({ roll, class: cls, year });

    if (!student)
      return res.status(404).json({ message: "Student not found" });

    student.name = name;
    student.father = father;
    student.aadhar = aadhar;
    student.dob = dob;
    student.mobile = mobile;
    student.pen = pen;
    student.apaar = apaar;

    await student.save();

    res.json({ message: "Student details updated successfully" });
  } catch (e) {
    console.error("Update Error:", e);
    res.status(500).json({ message: "Error updating student" });
  }
});


// ---------------------- SAFE FALLBACK ROUTE ----------------------
app.use((req, res, next) => {
  if (
    req.method === "GET" &&
    !req.path.startsWith("/api/") &&
    !req.path.includes(".")
  ) {
    return res.sendFile(path.join(__dirname, "public", "index.html"));
  }
  next();
});

// ---------------------- START SERVER ----------------------
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB ✔");

    await createDefaultAdmin();

    app.listen(5000, () =>
      console.log("Server running at http://localhost:5000 ✔")
    );
  })
  .catch((err) => {
    console.error("MongoDB Error:", err);
  });
