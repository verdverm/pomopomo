package main

import (
	"log"
	"net/http"
	"strings"

	"github.com/ant0ine/go-json-rest/rest"
	// "github.com/jinzhu/gorm"
)

// helper functions

func checkUid(uid string, w rest.ResponseWriter, req *rest.Request) bool {
	if req.Env["REMOTE_USER"] == nil {
		rest.Error(w, "remote user is nil", http.StatusInternalServerError)
		return false
	}

	token_uid := strings.Trim(req.Env["REMOTE_USER"].(string), "\"")
	if token_uid == "" {
		rest.Error(w, "remote user is empty", http.StatusInternalServerError)
		return false
	}

	if uid != token_uid {
		rest.Error(w, "token error", http.StatusInternalServerError)
		return false
	}
	return true
}

func getUid(w rest.ResponseWriter, req *rest.Request) string {
	if req.Env["REMOTE_USER"] == nil {
		rest.Error(w, "remote user is nil", http.StatusInternalServerError)
		return ""
	}

	token_uid := strings.Trim(req.Env["REMOTE_USER"].(string), "\"")
	return token_uid
}

// endpoint handlers

func CreateTables(w rest.ResponseWriter, req *rest.Request) {

	err := db.DB().Ping()
	if err != nil {
		log.Fatalf("Ping error: ", err)
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Println("Connected!!!")

	log.Println("AutoMigrating - UserAuth!!!")
	db.AutoMigrate(&UserAuth{})

	// log.Println("AutoMigrating - Recipe!!!")
	// db.AutoMigrate(&Recipe{})

	w.WriteJson(map[string]string{"result": "success!"})
}
