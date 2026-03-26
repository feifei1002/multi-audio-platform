# Multi Audio Platform Application

## Prerequistes
Ensure you have the following installed:
* **Java 21** (JDK)
* **Node.js** (v18+)
* **PostgreSQL** (v15+)
* Please also accept the invitation link from **Neon** that are sent to your email.

## Database Setup
1. Navigate to: `server/src/main/resources/`.
2. Create a file named `application-local.properties` (`application-local.properties.example` is provided).
3. Replace `provided_username` and `provided_password` with your username and password from Neon. The username and password will be provided in a txt file in our Discord server.

## Spring Email Setup
1. Navigate to: `server/src/main/resources/`.
2. Create a file named `application-local.properties` (`application-local.properties.example` is provided).
3. Replace `provided_email_username` and `provided_email_password` with your username and password provided on our Discord server.

***Please make sure you configure database and spring email setups first before setting up your frontend and backend, otherwise the application will fail to run.***

## Backend Configuration
1. For **macOS** users, please run this command first from the project `root` folder: `chmod +x server/gradlew`.
2. Change your directory to the `server` folder, and then run this command: `./gradlew build`

## Frontend Configuration
1. Create a `.env` file in the `/client` folder (`.env.example` is provided) to point to your backend.
2. Change your directory to the `client` folder, and then run this command: `npm install`.

## Run Application

You have 3 options to run the application depending on your preference:

#### Option 1: Using NPM Scripts (Recommended)
1. Run `npm run start:server` in a terminal from the project `root` folder to run the backend.
2. Open another shell, run `npm run start:client` in the `root` folder to run the frontend.

#### Option 2: Run Both Simultaneously
1. Run `npm run dev` in the project `root` folder to launch both backend and frontend in a single terminal window using `concurrently`.

#### Option 3: Manual Execution (Folder-specific)
If you prefer to run services directly from their respective directories:

* **Backend (Spring Boot):**
    ```
    cd server
    ./gradlew bootRun  # Windows users: use .\gradlew.bat bootRun
    ```
* **Frontend (Expo):**
    ```
    cd client
    npx expo start
    ```

To check if everything works:
1. Go to `http://{YOUR_IP}:8080/audio` or `http://localhost:8080/audio` if the page displays some data of audios means your are connected to the database.
2. Go to `http://{YOUR_IP}:8081` or `http://localhost:8081` if the page displays `Backend is reachable!` means every works.
