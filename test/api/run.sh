#!/bin/bah

echo "Running API tests"

jasmine-node auth_spec.js

# manually plug details into auth_data.js ...
jasmine-node first_spec.js 
jasmine-node lotsa_spec.js 
jasmine-node pomos_spec.js 
