package main

import (
	"os"
	"reflect"

	"github.com/bitly/go-simplejson"
	"github.com/verdverm/frisby"
)

var (
	URL    = "http://localhost:8080/auth/"
	UUID   = "4fa54e0-1edb-4051-a175-0076603cde7"
	TOKEN  = ""
	TRAVIS = ""
)

func main() {
	TRAVIS = os.Getenv("TRAVIS")

	if TRAVIS == "true" {
		regi := map[string]string{
			"username": "test",
			"email":    "test@domain.com",
			"password": "test",
			"confirm":  "test",
		}
		frisby.Create("Test successful registration").
			Post(URL + "register").
			SetJson(regi).
			Send().
			ExpectStatus(200).
			AfterJson(func(F *frisby.Frisby, json *simplejson.Json, err error) {
			UUID, _ = json.Get("uid").String()
			TOKEN, _ = json.Get("token").String()
		})
	}

	creds := map[string]string{
		"username": "test",
		"password": "test",
	}
	frisby.Create("Test successful user login").
		Post(URL+"login").
		SetJson(creds).
		Send().
		ExpectStatus(200).
		ExpectJsonType("uid", reflect.String).
		ExpectJson("uid", UUID)

	bad_username := map[string]string{
		"username": "test2",
		"password": "test",
	}
	frisby.Create("Test bad username login").
		Post(URL+"login").
		SetJson(bad_username).
		Send().
		ExpectStatus(400).
		ExpectJson("Error", "login failure")

	bad_password := map[string]string{
		"username": "test",
		"password": "test2",
	}
	frisby.Create("Test bad password login").
		Post(URL+"login").
		SetJson(bad_password).
		Send().
		ExpectStatus(400).
		ExpectJson("Error", "login failure")

	regi := map[string]string{
		"username": "test",
		"email":    "test@domain.com",
		"password": "test",
		"confirm":  "test",
	}
	frisby.Create("Test username conflict at registration").
		Post(URL+"register").
		SetJson(regi).
		Send().
		ExpectStatus(400).
		ExpectJson("Error", "Username taken")

	regi["username"] = "test2"
	frisby.Create("Test email conflict at registration").
		Post(URL+"register").
		SetJson(regi).
		Send().
		ExpectStatus(400).
		ExpectJson("Error", "Email taken")

	regi["email"] = "test2@domain.com"
	regi["confirm"] = "confirm"
	frisby.Create("Test password mismatch at registration").
		Post(URL+"register").
		SetJson(regi).
		Send().
		ExpectStatus(400).
		ExpectJson("Error", "Password mismatch")

	regi["username"] = ""
	regi["confirm"] = "password"
	frisby.Create("Test empty username at registration").
		Post(URL+"register").
		SetJson(regi).
		Send().
		ExpectStatus(400).
		ExpectJson("Error", "Empty Username")

	regi["email"] = ""
	regi["username"] = "test2"
	frisby.Create("Test empty email at registration").
		Post(URL+"register").
		SetJson(regi).
		Send().
		ExpectStatus(400).
		ExpectJson("Error", "Empty Email")

	regi["email"] = "test2@domain.com"
	regi["password"] = ""
	regi["confirm"] = ""
	frisby.Create("Test empty password and confirm at registration").
		Post(URL+"register").
		SetJson(regi).
		Send().
		ExpectStatus(400).
		ExpectJson("Error", "Empty Password")

	frisby.Global.PrintReport()
}
