# Online at
 #### API - https://devquiz-backend.herokuapp.com/
 #### DOCS - https://documenter.getpostman.com/view/9069060/Szf82oH4?version=latest#25856df8-ca1d-422b-85bb-dbb6b8bd48ec

# To run
#### 1 - create .env file or set your environment variables as in the .env.example
#### 2 - npm run setup (to run migrations and seeds)

# To debug
#### 1 - npm run dev (to run migrations and seeds)

# Database
#### SQLite - To use SQLITE change DB_CONNECTION in .env or environment variables to sqlite
#### MySql - To use MySql change DB_CONNECTION in .env or environment variables to mysql


# Match sequence diagram
![Match sequence diagram](https://raw.githubusercontent.com/erickcouto/devquiz/master/backend/SequenceDiagram.png)

# Socket events
### (client) join-match
```json
{
	"userId" : 1,
	"matchId" : 1
}
```

### (server) player-joined
```json
{
	"owner": {
		"id": 1,
		"login": "githubuser",
		"name": "Primeiro segundo nome",
		"avatar": "http://imagem.png",
	"	repos": 0
},
	opponent: {
		"id": 1,
		"login": "githubuser",
		"name": "Primeiro segundo nome",
		"avatar": "http://imagem.png",
		"repos": 0
	}
}
```

### (client) set-ready
```json
{
	"userId" : 1,
	"matchId" : 1
}
```

### (server) player-ready
```json
{
	"userId": 1
}
```

### (server) match-start

### (server) match-start-round
```json
{
	"currentRound": 1,
	"totalRound": 5
}
```

### (server) match-start-question
```json
{
	"id": 0,
	"title": "Pergunta 01",
	"image": "http://image.png",
	"answer1": "Resposta 01",
	"answer2": "Resposta 02",
	"answer3": "Resposta 03",
	"answer4": "Resposta 04",
}
```

### (server) match-countdown
```json
{
	"seconds": 10
}
```

### (client) answer-question
```json
{
	"userId" : 1,
	"matchId" : 1,
	"questionId": 1,
	"answer":  1,
  "time":  5
}
```

### (server) match-round-end
```json
{
	"owner" : {
		"id": 1,
		"answer": 1,
		"score": 10
	},
	"opponent" : {
		"id": 2,
		"answer": 3,
		"score": 0
	},
	"correctAnswer": 1
}
```

### (server) match-end
```json
{
	"totalScore": 50,
	"wins": 5,
	"losses": 1
}
```

# Test client 

cd test_client

npm install

node client.js
