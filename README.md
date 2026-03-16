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


## Backend Configuration
1. ```npm run start:server``` to run the backend.

## Frontend Configuration
1. Create a ```.env``` file in the ```/client``` folder (```.env.example``` is provided) to point to your backend.
2. Change ```YOUR_IP``` to your actual IPv4 address. (```ipconfig``` in Command Prompt).
3. ```npm run start:client``` to run the frontend.


## Development Mode
1. ```npm run dev``` to run both backend and frontend simultaneously.
2. Go to ```http://{YOUR_IP}:8080``` or ```http://localhost:8080``` if the page displays some data of audios means your are connected to the database.
3. Go to ```http://{YOUR_IP}:8081``` or ```http://localhost:8081``` if the page displays ```Backend is reachable!``` means every works.
