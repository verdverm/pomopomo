package main

import (
	"fmt"
	"os"
	"time"

	"github.com/bitly/go-simplejson"
	"github.com/verdverm/frisby"
)

var (
	URL   = "http://localhost:8080/api/"
	UUID  = ""
	TOKEN = ""
)

func main() {
	UUID = os.Getenv("UUID")
	TOKEN = os.Getenv("TOKEN")
	frisby.Global.SetHeader("Authorization", "Bearer "+TOKEN)

	new_todo := map[string]string{
		"name":        "test pomos todo",
		"description": "this is a todo to test pomos!",
	}
	todo_id := ""
	todo_id_int := 0

	frisby.Create("POST pomos todo").
		Post(URL+"todo").
		SetJson(new_todo).
		Send().
		ExpectStatus(200).
		ExpectJson("result", "success!").
		AfterJson(func(F *frisby.Frisby, json *simplejson.Json, err error) {

		todo_id_json := json.GetPath("todo", "id")
		var cerr error
		todo_id_int, cerr = todo_id_json.Int()
		if cerr != nil {
			F.AddError(cerr.Error())
		}
		todo_id = fmt.Sprint(todo_id_int)

	})

	frisby.Create("POST pomo start").
		Post(URL+"todo/"+todo_id+"/pomo_start").
		Send().
		ExpectStatus(200).
		ExpectJson("result", "pomo started").
		ExpectJson("tid", todo_id_int)

	frisby.Create("GET existing todo by id").
		Get(URL+"todo/"+todo_id).
		Send().
		ExpectStatus(200).
		ExpectJson("id", todo_id_int).
		ExpectJson("Uuid", UUID).
		ExpectJson("Name", "test pomos todo")

	frisby.Create("POST pomo stop").
		Put(URL+"todo/"+todo_id+"/pomo_stop").
		Send().
		ExpectStatus(200).
		ExpectJson("result", "early").
		ExpectJson("tid", todo_id_int)

	frisby.Create("POST pomo start (with sleep 60s)").
		Post(URL+"todo/"+todo_id+"/pomo_start").
		Send().
		ExpectStatus(200).
		ExpectJson("result", "pomo started").
		ExpectJson("tid", todo_id_int)

	time.Sleep(time.Second * 60)

	frisby.Create("POST pomo stop").
		Put(URL+"todo/"+todo_id+"/pomo_stop").
		Send().
		ExpectStatus(200).
		ExpectJson("result", "ended").
		ExpectJson("tid", todo_id_int)

	frisby.Create("DELETE existing todo by id").
		Delete(URL+"todo/"+todo_id).
		Send().
		ExpectStatus(200).
		ExpectJson("result", "success!").
		ExpectJson("tid", todo_id_int)

	frisby.Global.PrintReport()

}
