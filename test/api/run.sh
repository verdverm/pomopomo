#!/bin/bash

set -ev 

echo "Running API tests"
echo "TRAVIS = ${TRAVIS}, ${CI}"

jasmine-node auth_spec.js

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


jasmine-node first_spec.js 
jasmine-node lotsa_spec.js 
jasmine-node pomos_spec.js 
