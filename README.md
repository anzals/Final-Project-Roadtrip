# Final-Project-Roadtrip

**Road Trip Mate** is a full-stack web app for planning road trips with route mapping, pitstop suggestions, petrol cost estimation, and trip collaboration.

---

### 1. Create a Virtual Environment (env) File:
In the terminal write:

    - Windows: python -m venv env
    - Mac/Linux: python3 -m venv env

### 2. Activate Virtual Environment
    - Windows: .\env\Scripts\activate
    - Mac/Linux: source env/bin/activate

### 3. Install the Backend
- Install python version (3.13.2 or higher)
- In the root directory:
    - pip install -r requirements.txt

### 4. Install the Frontend
- cd frontend
- npm install (installs the frontend dependencies listed in the package.json file)

### 5. Setup the database
- Install PostgreSQL (version 15.11), if you don't already have it via https://www.postgresql.org/download/. This also installs Pgadmin4.
- Confirm postgreSQL is installed -> psql --version
- Update database password (around line 112) in settings with your database password.
- Create a database in PgAdmin4 called "roadtripdatabase".
- Enter the backend directory:
    - cd ../
    - cd backend
    - python manage.py migrate
- refresh your database

### 6. Run the Servers
Make sure you are in the environment before running the server.

    - cd backend
    - python manage.py runserver


And then get the url from and put in your browser:

    - cd frontend
    - npm run dev

### Project Folder Structure

RoadtripProject/
├── backend/                 
│   ├── api/              
│   │   ├── migrations/     
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── backend/               
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── manage.py             
├── frontend/               
│   ├── public/                
│   │   ├── images/
│   │   │   ├── login-img.jpg
│   │   │   ├── signup-img.jpg
│   │   │   └── logo.jpg
│   │   └── vite.svg
│   ├── src/                  
│   │   ├── assets/        
│   │   ├── components/   
│   │   │   ├── AutocompleteInput.jsx
│   │   │   ├── CollaboratorManager.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx, 
│   │   │   ├── Layout.jsx
│   │   │   ├── LoadingIndicator.jsx,
│   │   │   ├── MapDisplay.jsx,
│   │   │   ├── ProtectedRoute.jsx,
│   │   │   ├── RouteDetails.jsx,
│   │   │   └── Trip.jsx
│   │   ├── data/              
│   │   │   └── fuelData.json
│   │   ├── pages/             # Page-level React components
│   │   │   ├── AddPitstop.jsx
│   │   │   ├── EditTrip.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MapRoute.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── PetrolCalculator.jsx
│   │   │   ├── PlanTrip.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── TripDetails.jsx
│   │   │   ├── TripSummary.jsx
│   │   │   ├── UpdateRoute.jsx
│   │   ├── styles/           
│   │   │   ├── AddPitstop.css
│   │   │   ├── CollaboratorManager.css     
│   │   │   ├── EditTrip.css   
│   │   │   ├── Footer.css   
│   │   │   ├── Form.css   
│   │   │   ├── Header.css   
│   │   │   ├── Home.css   
│   │   │   ├── Layout.css   
│   │   │   ├── LoadingIndicator.css   
│   │   │   ├── Login.css   
│   │   │   ├── MapDisplay.css   
│   │   │   ├── MapRoute.css   
│   │   │   ├── PetrolCalculator.css   
│   │   │   ├── PlanTrip.css   
│   │   │   ├── Profile.css   
│   │   │   ├── Register.css   
│   │   │   ├── Trip.css   
│   │   │   ├── TripDetails.css   
│   │   │   ├── TripSummary.css   
│   │   │   ├── UpdateRoute.css   
│   │   ├── utils/           
│   │   │   ├── convert.js
│   │   │   ├── validate.js
│   │   ├── api.js   
│   │   ├── App.jsx
│   │   ├── Contstants.js         
│   │   ├── index.css          
│   │   └── main.jsx         
│   ├── .env
│   ├── .gitignore
│   ├── index.html
│   ├── package-lock.json    
│   ├── package.json
│   ├── README.md            
│   ├── vite.config.js    
├── README.md              
├── requirements.txt  