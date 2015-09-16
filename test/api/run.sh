#!/bin/bash

set -e 

echo "Running API tests"
# echo "TRAVIS = ${TRAVIS}, ${CI}"

go run auth_spec.go

### set UUID / TOKEN env variable from a successful login
(
	curl -s -S -X POST localhost:8080/auth/login --header "Content-Type: application/json" -d '{
		"username": "test",
		"password": "test"
	}'
) > response.txt

UUID=`cat response.txt | jq -r ".uid"`
TOKEN=`cat response.txt | jq -r ".token"`
rm response.txt

export UUID
export TOKEN

go run first_spec.go 
go run lotsa_spec.go 
go run pomos_spec.go 
