🔔 Smart Doorbell

An intelligent doorbell system that leverages face recognition to identify visitors, captures snapshots for history logging, and sends real-time alerts to homeowners. Built using TypeScript, Vite, and Drizzle ORM.
📸 Demo

Replace with an actual image or GIF showcasing your project's functionality.
🚀 Features

    Face Recognition: Utilizes pre-trained models to detect and recognize faces.

    Snapshot History: Stores images of visitors with timestamps for future reference.

    Real-Time Alerts: Sends instant notifications to the homeowner upon visitor detection.

    Touchless Operation: Detects presence without the need for physical interaction.

    Secure Access: Grants or denies entry based on recognized faces.

🛠️ Tech Stack

    Frontend: Vite, TypeScript, Tailwind CSS

    Backend: Node.js, Express.js, Drizzle ORM

    Database: SQLite (via Drizzle ORM)

    Others: PostCSS, Vercel for deployment

📂 Project Structure

smart-doorbell/
├── client/                 # Frontend application
│   ├── index.html
│   └── src/
├── server/                 # Backend application
│   ├── face-models.ts
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── vite.ts
├── shared/                 # Shared resources
│   └── schema.ts
├── public/                 # Public assets
│   └── models/
├── drizzle.config.ts       # Drizzle ORM configuration
├── faces.json              # Stored face data
├── generated-icon.png      # Application icon
├── package.json            # Project metadata
├── package-lock.json       # Dependency lock file
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── theme.json              # Theme settings
├── tsconfig.json           # TypeScript configuration
├── vercel.json             # Vercel deployment configuration
└── vite.config.ts          # Vite configuration

⚙️ Installation

    Clone the Repository:

git clone https://github.com/YOUR_USERNAME/smart-doorbell.git
cd smart-doorbell

Install Dependencies:

npm install

Configure Environment:

    Set up necessary environment variables and configurations as per your setup.

Run the Application:

    npm run dev

🧪 How It Works

    The system continuously monitors the door area using the camera.

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
