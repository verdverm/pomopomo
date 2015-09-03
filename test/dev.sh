#!/bin/bash

### create the db and tables
# sqlite3 recapi.db
# curl -X GET localhost:8080/auth/createtables

### register a user and get a token
# curl -X POST localhost:8080/auth/register --header "Content-Type: application/json" -d '{
# 	"email": "tony@worm.com",
# 	"username": "tony",
# 	"password": "secret",
# 	"confirm": "secret"
# }'

#copy and paste the token into the following variable
token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0NDM4MTcwOTQsImlkIjoiYzQ2MTU3ZC1mYjgzLTQwZDAtOWI0NS1mNGMzM2VmZDkxOSJ9.tsN_4QZyTmGX0ILiMgihLfbpgJawnkPyAU_GO6fjyY8"

auth_header="Authorization: Bearer $token"

apicall() {
	curl -X $1 localhost:8080/api/$2 --header "$auth_header" --header "Content-Type: application/json" -d "$3"
	echo ""
}

# test the Authorization
# apicall GET auth_test '{}'

# check the status
# apicall GET .status '{}'


apicall GET todo '{}'
apicall GET todo/0 '{}'

apicall POST todo '{"name": "todo3", "description": "description"}'

apicall GET todo/2 '{}'

apicall PUT todo/2 '{"description": "blah blah blah"}'

apicall GET todo/2 '{}'

# apicall DELETE todo/2 '{}'
