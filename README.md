# 🛡️ ClamSecure – File Virus Scanner

ClamSecure is a secure file virus scanning web application that enables users to upload files, scan them for potential threats using ClamAV, and manage their scan history. It includes a minimal dashboard with Google login, real-time scan feedback, report exports, and infected file handling.

---

## 🔍 Features

- 🔐 Google Authentication (via Firebase)
- 📂 File Upload with 2GB size validation
- ⚙️ ClamAV-based virus scanning (via `clamscan`)
- 📄 View scan results in a detailed table
- ⚠️ Identify and delete infected files
- 🧾 Export scan reports (PDF/CSV)
- 📚 Scan history with advanced filters
- 🔎 Filter by file type, scan status, and virus name
- 📊 Dashboard with analytics (planned)

---

## 🧰 Tech Stack

| Layer     | Technology                           |
|-----------|---------------------------------------|
| Frontend  | React.js, Tailwind CSS                |
| Backend   | Node.js, Express.js                   |
| Database  | PostgreSQL                            |
| Auth      | Firebase Google Login                 |
| Scanner   | ClamAV via `clamscan` (WSL/Ubuntu)    |
| Upload    | Multer (Local file storage)           |

---

## 📸 Screenshots

> ![Screenshot 2025-07-06 212428](https://github.com/user-attachments/assets/7f2dbc83-e4d9-48ac-8075-56a40887de13)
> ![image](https://github.com/user-attachments/assets/2d1f253f-5e3b-467d-8c5e-cecbb171b770)
> ![image](https://github.com/user-attachments/assets/7bf17530-2ac5-4810-a3c4-983098173f0d)
> ![image](https://github.com/user-attachments/assets/be568202-3068-4b62-ac57-4606928c383e)






---

## 📂 Folder Structure

```
clamsecure/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── config/
│   └── uploads/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/clamsecure.git
cd clamsecure
```

### 2. Backend Setup

```bash
cd backend
npm install
```

- Set up your `.env` file:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/clamsecure
FIREBASE_API_KEY=...
```

- Ensure ClamAV is installed via WSL on Windows:
```bash
sudo apt update
sudo apt install clamav
sudo freshclam
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

---

## 🧪 How it Works

1. User logs in with Google.
2. Uploads a file through the UI.
3. File is stored locally and scanned with ClamAV.
4. Results are saved in PostgreSQL.
5. Users can view, delete, or export scan results.

---

## 📌 Future Enhancements

- 📈 Visual charts for scan insights
- ✉️ Email notifications for infected files
- 🌐 Multi-user scan dashboard
- ☁️ Hybrid storage with AWS S3 (optional)
- 🔐 Admin panel for managing reports

---

## 👤 Author

**Rudra Pratap Singh**  
[LinkedIn](https://www.linkedin.com/in/rudra-pratap-singh-19bbbb303/) • [GitHub](https://github.com/RudraPratap22)

---

## 📄 License

This project is licensed under the MIT License.
