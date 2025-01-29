# ITCS8112Team1

## How To Run
Create the file `mern/server/config.env` with your Atlas URI and the server port:
```
mongodb+srv://<username>:<password>@<cluster>.<projectId>.mongodb.net/?retryWrites=true&w=majority&appName=<cluster>
PORT=5050
```

Start server:
```
cd mern/server
npm install
npm start
```

Start Web server
```
cd mern/client
npm install
npm run dev
```
