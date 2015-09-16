#!/bin/bash

set -ev

go get github.com/go-sql-driver/mysql
go get github.com/lib/pq
go get code.google.com/p/go.crypto/bcrypt
go get github.com/twinj/uuid

go get github.com/StephanDollberg/go-json-rest-middleware-jwt
go get github.com/dgrijalva/jwt-go

set +e
go get github.com/ant0ine/go-json-rest
set -e

go get github.com/jinzhu/gorm

go get github.com/mozillazg/request
go get github.com/bitly/go-simplejson
go get github.com/verdverm/frisby
