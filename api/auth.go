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
	//
	// Username and Email

	log.Println("Checking username!!!")
	// CHECK username
	auth := UserAuth{}
	err = db.Where("Username = ?", login.Username).Or("email = ?", login.Username).First(&auth).Error
	if err == gorm.RecordNotFound {
		log.Println("Username NOT FOUND!!!")
		rest.Error(w, "unknown username", http.StatusBadRequest)
		return
	} else if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	log.Println("Username OK!!!")
	log.Println("Checking password!!!")

	// check password
	err = bcrypt.CompareHashAndPassword(auth.HashedPassword, []byte(login.Password))
	if err != nil {
		rest.Error(w, "login failure", http.StatusBadRequest)
		return
	}

	// login to jwt and return token
	// jwt_middleware.LoginHandler(w, req)
	token := JWT.New(JWT.GetSigningMethod(jwt_middleware.SigningAlgorithm))
	token.Claims["id"] = auth.Uid
	token.Claims["exp"] = time.Now().Add(jwt_middleware.Timeout).Unix()
	if jwt_middleware.MaxRefresh != 0 {
		token.Claims["orig_iat"] = time.Now().Unix()
	}
	tokenString, err := token.SignedString(jwt_middleware.Key)

	wire := UserWire{
		Uid:   auth.Uid,
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

	// check username DOESNT exist in datastore
	auth := UserAuth{}
	err = db.Where("username = ?", register.Username).First(&auth).Error
	if err == gorm.RecordNotFound {
		goto okusername
	}
	if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteJson(&PomoError{Error: "username taken"})
	return

okusername:
	log.Println("Username OK!!!")

	err = db.Where("email = ?", register.Email).First(&auth).Error
	if err == gorm.RecordNotFound {
		goto okemail
	}
	if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteJson(&PomoError{Error: "email taken"})
	return

okemail:
	log.Println("Email OK!!!")

	// do VALIDATION checks
	// check email
	if register.Email == "" {
		w.WriteJson(&PomoError{Error: "Empty Email"})
		return
	}

	// check username
	if register.Username == "" {
		w.WriteJson(&PomoError{Error: "Empty Username"})
		return
	}

	// check password
	if register.Password == "" {
		w.WriteJson(&PomoError{Error: "Empty Password"})
		return
	}

	// check password against confirm
	if register.Password != register.Confirm {
		w.WriteJson(&PomoError{Error: "Passwords don't match"})
		return
	}

	// PREP data objects
	uid := uuid.NewV4().String()
	uid = uid[1 : len(uid)-1]

	user := UserAuth{}
	user.Uid = uid
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
	token.Claims["id"] = user.Uid
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
