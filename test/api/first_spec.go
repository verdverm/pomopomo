package main

import (
	gojson "encoding/json"
	"fmt"
	"os"
	"reflect"

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

	frisby.Create("Test token login").
		Get(URL+"auth_test").
		SetHeader("Authorization", "Bearer "+TOKEN).
		Send().
		ExpectStatus(200).
		ExpectJsonType("authed", reflect.String).
		ExpectJson("authed", UUID).
		PrintReport()

	frisby.Create("GET all todos").
		Get(URL+"todo").
		SetHeader("Authorization", "Bearer "+TOKEN).
		Send().
		ExpectStatus(200).
		AfterJson(func(F *frisby.Frisby, json *simplejson.Json, err error) {

		todos, _ := json.Array()
		for _, t := range todos {
			todo := t.(map[string]interface{})
			todo_id := todo["id"].(gojson.Number).String()
			f := frisby.Create("Delete todo "+todo_id).
				Delete(URL+"todo/"+todo_id).
				SetHeader("Authorization", "Bearer "+TOKEN).
				Send().
				ExpectStatus(200)

			for _, e := range f.Errors() {
				F.AddError("Deleting Todo " + todo_id + " " + e.Error())
			}
		}
	}).
		PrintReport()

	frisby.Create("GET non-existant todo").
		Get(URL+"todo/0").
		SetHeader("Authorization", "Bearer "+TOKEN).
		Send().
		ExpectStatus(400).
		ExpectJson("Error", "todo not found").
		PrintReport()

	frisby.Create("GET all todos (empty)").
		Get(URL+"todo").
		SetHeader("Authorization", "Bearer "+TOKEN).
		Send().
		ExpectStatus(200).
		ExpectJson("", []interface{}{}).
		PrintReport()

	new_todo := map[string]string{
		"name":        "test todo",
		"description": "this is my first todo posted from frisby!",
	}
	todo_id := ""
	todo_id_int := 0
	frisby.Create("POST new todo").
		Post(URL+"todo").
		SetHeader("Authorization", "Bearer "+TOKEN).
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

	}).
		PrintReport()

	frisby.Create("GET existing todo by id").
		Get(URL+"todo/"+todo_id).
		SetHeader("Authorization", "Bearer "+TOKEN).
		Send().
		ExpectStatus(200).
		ExpectJson("id", todo_id_int).
		ExpectJson("Uuid", UUID).
		ExpectJson("Name", "test todo").
		PrintReport()

	frisby.Create("DELETE existing todo by id").
		Delete(URL+"todo/"+todo_id).
		SetHeader("Authorization", "Bearer "+TOKEN).
		Send().
		ExpectStatus(200).
		ExpectJson("result", "success!").
		ExpectJson("tid", todo_id_int).
		PrintReport()

}
