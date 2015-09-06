package main

import (
	"log"
	"net/http"
	"time"

	"code.google.com/p/go.crypto/bcrypt"
	"github.com/StephanDollberg/go-json-rest-middleware-jwt"
	"github.com/ant0ine/go-json-rest/rest"
	JWT "github.com/dgrijalva/jwt-go"
	"github.com/jinzhu/gorm"
	"github.com/twinj/uuid"
)

var (
	jwt_middleware = jwt.JWTMiddleware{
		Key:        []byte("secret key"),
		Realm:      "sj auth",
		Timeout:    time.Hour * 24 * 30,
		MaxRefresh: 0,
		Authenticator: func(userId string, password string) bool {
			// if (userId == "user" && password == "password") || (userId == "admin" && password == "admin") {
			// 	return true
			// }
			return true
		},
		Authorizator: func(userId string, request *rest.Request) bool {
			return true
		},
	}
)

func LoginHandler(w rest.ResponseWriter, req *rest.Request) {

	// c := appengine.NewContext(req.Request)

	// UNPACK user login data
	login := UserLogin{}
	err := req.DecodeJsonPayload(&login)
	if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// TODO case insensitive comparison of
	// Username and Email

	// CHECK username
	auth := UserAuth{}
	err = db.Where("Username = ?", login.Username).Or("email = ?", login.Username).First(&auth).Error
	if err == gorm.RecordNotFound {
		rest.Error(w, "login failure", http.StatusBadRequest)
		return
	} else if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// check password
	err = bcrypt.CompareHashAndPassword(auth.HashedPassword, []byte(login.Password))
	if err != nil {
		rest.Error(w, "login failure", http.StatusBadRequest)
		return
	}

	// generate the JWT token
	token := JWT.New(JWT.GetSigningMethod(jwt_middleware.SigningAlgorithm))
	token.Claims["id"] = auth.Uuid
	token.Claims["exp"] = time.Now().Add(jwt_middleware.Timeout).Unix()
	if jwt_middleware.MaxRefresh != 0 {
		token.Claims["orig_iat"] = time.Now().Unix()
	}
	tokenString, err := token.SignedString(jwt_middleware.Key)

	wire := UserWire{
		Uid:   auth.Uuid,
		Token: tokenString,
	}

	w.WriteJson(&wire)

}

func RegisterHandler(w rest.ResponseWriter, req *rest.Request) {

	log.Println("GOT HERE!!!")

	// unpack new user data
	register := UserRegister{}
	err := req.DecodeJsonPayload(&register)
	if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// do VALIDATION checks
	// check email
	if register.Email == "" {
		rest.Error(w, "Empty Email", http.StatusBadRequest)
		return
	}
	// check username
	if register.Username == "" {
		rest.Error(w, "Empty Username", http.StatusBadRequest)
		return
	}
	// check password
	if register.Password == "" {
		rest.Error(w, "Empty Password", http.StatusBadRequest)
		return
	}
	// check password against confirm
	if register.Password != register.Confirm {
		rest.Error(w, "Password mismatch", http.StatusBadRequest)
		return
	}

	// check username DOESNT exist in datastore
	auth := UserAuth{}
	okusername := false
	err = db.Where("username = ?", register.Username).First(&auth).Error
	if err == gorm.RecordNotFound {
		okusername = true
	} else if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if !okusername {
		rest.Error(w, "Username taken", http.StatusBadRequest)
		return
	}
	log.Println("Username OK!!!")

	okemail := false
	err = db.Where("email = ?", register.Email).First(&auth).Error
	if err == gorm.RecordNotFound {
		okemail = true
	} else if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if !okemail {
		rest.Error(w, "Email taken", http.StatusBadRequest)
		return
	}

	log.Println("Email OK!!!")

	// PREP data objects
	uid := uuid.NewV4().String()
	uid = uid[1 : len(uid)-1]

	user := UserAuth{}
	user.Uuid = uid
	user.Username = register.Username
	user.Email = register.Email
	user.HashedPassword, _ = bcrypt.GenerateFromPassword([]byte(register.Password), bcrypt.DefaultCost)

	log.Println("Beginning transaction!!!")

	//  BEGIN DB transaction
	txn := db.Begin()
	err = txn.Error
	if err != nil {
		rest.Error(w, "txn begin: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// RUN DB actions
	log.Println("Running user transaction!!!")
	err = db.Create(&user).Error
	if err != nil {
		err = txn.Rollback().Error
		if err != nil {

			rest.Error(w, "txn auth-rollback: "+err.Error(), http.StatusInternalServerError)
			return
		}
		rest.Error(w, "txn auth: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// COMMIT DB transaction
	log.Println("Committing transaction!!!")
	err = txn.Commit().Error
	if err != nil {
		err = txn.Rollback().Error
		if err != nil {

			rest.Error(w, "txn commit-rollback: "+err.Error(), http.StatusInternalServerError)
			return
		}

		rest.Error(w, "txn commit: "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Println("Preparing token!!!")

	// register to jwt and return token
	// jwt_middleware.LoginHandler(w, req)
	token := JWT.New(JWT.GetSigningMethod(jwt_middleware.SigningAlgorithm))
	token.Claims["id"] = user.Uuid
	token.Claims["exp"] = time.Now().Add(jwt_middleware.Timeout).Unix()
	if jwt_middleware.MaxRefresh != 0 {
		token.Claims["orig_iat"] = time.Now().Unix()
	}
	tokenString, err := token.SignedString(jwt_middleware.Key)

	log.Println("Wiring and returning!!!")
	wire := UserWire{
		Uid:   uid,
		Token: tokenString,
	}

	w.WriteJson(&wire)

}
