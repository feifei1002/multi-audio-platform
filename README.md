# Multi Audio Platform Application

## Prerequistes
Ensure you have the following installed:
* **Java 21** (JDK)
* **Node.js** (v18+)
* **PostgreSQL** (v15+)
* Please also accept the invitation link from **Neon** that are sent to your email.

## Database Setup
1. Navigate to: ```server/src/main/resources/```.
2. Create a file named ```application-local.properties``` (```application-local.properties.example``` is provided).
3. Replace ```provided_username``` and ```provided_password``` with your the username and password from Neon. The username and password will be provided in a txt file in our Discord server.

***Please make sure you configure database setup first before setting up your frontend and backend, otherwise the application will fail to run.***


## Backend Configuration
1. For **macOS** users, please run this command first in your ```root``` folder: ```chmod +x server/gradlew```.

## Frontend Configuration
1. Create a ```.env``` file in the ```/client``` folder (```.env.example``` is provided) to point to your backend.
2. Change ```YOUR_IP``` to your actual IPv4 address. (```ipconfig``` in Command Prompt). **(This is very important)**
3. Change your directory to the ```client``` folder, and then run this command: ```npm install```.
4. For **macOS users with ARM64**, please run this extra command: ```npm install -D lightningcss-darwin-arm64```.

## Run Application
You have 2 options to run the application:
#### Option 1:
1. Run ```npm run start:server``` in a terminal from your ```root``` folder to run the backend.
2. Open another terminal, run ```npm run start:client``` to run the frontend.

#### Option 2:
 1. ```npm run dev``` to run both backend and frontend simultaneously.

To check if everything works:
1. Go to ```http://{YOUR_IP}:8080/audio``` or ```http://localhost:8080/audio``` if the page displays some data of audios means your are connected to the database.
2. Go to ```http://{YOUR_IP}:8081``` or ```http://localhost:8081``` if the page displays ```Backend is reachable!``` means every works.
