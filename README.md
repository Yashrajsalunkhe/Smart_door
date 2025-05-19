🔔 Smart Doorbell

An intelligent doorbell system that leverages face recognition to identify visitors, captures snapshots for history logging, and sends real-time alerts to homeowners. Built using Raspberry Pi, OpenCV, and Python.
📸 Demo

Replace with an actual image or GIF showcasing your project's functionality.
🚀 Features

    Face Recognition: Utilizes OpenCV's LBPH algorithm to detect and recognize faces.

    Snapshot History: Stores images of visitors with timestamps for future reference.

    Real-Time Alerts: Sends instant notifications to the homeowner upon visitor detection.

    Touchless Operation: Detects presence without the need for physical interaction.

    Secure Access: Grants or denies entry based on recognized faces.

🛠️ Tech Stack

    Hardware: Raspberry Pi 4, Pi Camera Module

    Software: Python 3, OpenCV, Haar Cascade Classifier

    Libraries: NumPy, face_recognition, smtplib for email notifications

📂 Project Structure

smart-doorbell/
  client
  │   ├── index.html
  │   └── src
  ├── drizzle.config.ts
  ├── faces.json
  ├── generated-icon.png
  ├── package.json
  ├── package-lock.json
  ├── postcss.config.js
  ├── public
  │   └── models
  ├── server
  │   ├── face-models.ts
  │   ├── index.ts
  │   ├── routes.ts
  │   ├── storage.ts
  │   └── vite.ts
  ├── shared
  │   └── schema.ts
  ├── tailwind.config.ts
  ├── theme.json
  ├── tsconfig.json
  ├── vercel.json
  └── vite.config.ts


⚙️ Installation

    Clone the Repository:

git clone https://github.com/YOUR_USERNAME/smart-doorbell.git
cd smart-doorbell

Install Dependencies:

pip install -r requirements.txt

Prepare the Dataset:

    Collect images of known individuals and place them in the dataset/ directory.

    Run the training script:

    python train_model.py

Run the Application:

    python main.py

🧪 How It Works

    The system continuously monitors the door area using the Pi Camera.

    Upon detecting a face, it captures an image and compares it against the trained model.

    If the face is recognized, it logs the entry and sends a notification.

    If unrecognized, it alerts the homeowner and stores the image for review.

📸 Screenshots

Include relevant screenshots here.
📈 Future Enhancements

    Integrate with mobile app for remote access.

    Implement cloud storage for snapshots.

    Enhance recognition accuracy with deep learning models.

🤝 Contributors

    Yashraj

📄 License

This project is licensed under the MIT License.
