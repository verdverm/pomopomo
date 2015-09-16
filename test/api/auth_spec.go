package main

import (
	"os"
	"reflect"

	"github.com/bitly/go-simplejson"
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
		}).
			PrintReport()
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
		ExpectJson("uid", UUID).
		PrintReport()

	bad_username := map[string]string{
		"username": "test2",
		"password": "test",
	}
	frisby.Create("Test bad username login").
		Post(URL+"login").
		SetJson(bad_username).
		Send().
		ExpectStatus(400).
		ExpectJson("Error", "login failure").
		PrintReport()

	bad_password := map[string]string{
		"username": "test",
		"password": "test2",
	}
	frisby.Create("Test bad password login").
		Post(URL+"login").
		SetJson(bad_password).
		Send().
		ExpectStatus(400).
		ExpectJson("Error", "login failure").
		PrintReport()

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
		ExpectJson("Error", "Username taken").
		PrintReport()

	regi["username"] = "test2"
	frisby.Create("Test email conflict at registration").
		Post(URL+"register").
		SetJson(regi).
		Send().
		ExpectStatus(400).
		ExpectJson("Error", "Email taken").
		PrintReport()

	regi["email"] = "test2@domain.com"
	regi["confirm"] = "confirm"
	frisby.Create("Test password mismatch at registration").
		Post(URL+"register").
		SetJson(regi).
		Send().
		ExpectStatus(400).
		ExpectJson("Error", "Password mismatch").
		PrintReport()

	regi["username"] = ""
	regi["confirm"] = "password"
	frisby.Create("Test empty username at registration").
		Post(URL+"register").
		SetJson(regi).
		Send().
		ExpectStatus(400).
		ExpectJson("Error", "Empty Username").
		PrintReport()

	regi["email"] = ""
	regi["username"] = "test2"
	frisby.Create("Test empty email at registration").
		Post(URL+"register").
		SetJson(regi).
		Send().
		ExpectStatus(400).
		ExpectJson("Error", "Empty Email").
		PrintReport()

	regi["email"] = "test2@domain.com"
	regi["password"] = ""
	regi["confirm"] = ""
	frisby.Create("Test empty password and confirm at registration").
		Post(URL+"register").
		SetJson(regi).
		Send().
		ExpectStatus(400).
		ExpectJson("Error", "Empty Password").
		PrintReport()
}
