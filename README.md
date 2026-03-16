# Multi Audio Platform Application

## Prerequistes
Before starting, ensure you have the following installed:
* **Java 21** (JDK)
* **Node.js** (v18 or higher)
* **PostgreSQL** (v18)

## Database Setup
1. navigate to: ```server/src/main/resources/```
2. Create a file named ```application-local.properties``` (application-local.properties.example is provided)
3. Replace ```your_password``` with your actual Postgres password

* Option 1:
4. cd to ```root``` folder (multi-audio-platform)
5. Run the following command:
   ```npm run db:create``

* Option 2:
4. Open your terminal or **pgAdmin 4**.
5. Manually create the database ```audio_platform_db``` using pgAdmin UI.

6. Go to http://{YOUR_IP}:8080 if the page displays Backend is reachable! means everything works!


## Backend Configuration
1. ```npm run start:server``` to run the backend.

## Frontend Configuration
1. Create a ```.env``` file in the ```/client``` folder (.env.example is provided) to point to your backend.
2. Change ```YOUR_IP``` to your actual IPv4 address. (```ipconfig``` in Command Prompt).
3. ```npm run start:client``` to run the frontend.


## Development Mode
```npm run dev``` to run both at the same time.

