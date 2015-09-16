package main

import (
	"fmt"
	"os"

	"github.com/bitly/go-simplejson"
	"github.com/verdverm/frisby"
)

var (
	URL       = "http://localhost:8080/api/"
	UUID      = ""
	TOKEN     = ""
	NUM_TODOS = 50
)

func main() {
	UUID = os.Getenv("UUID")
	TOKEN = os.Getenv("TOKEN")

	new_todo := map[string]string{
		"name":        "lotsatodo #",
		"description": "this is my first todo posted from frisby!",
	}
	var todo_ids []string

	POST := frisby.Create("POST lotsa todo collector")
	DELETE := frisby.Create("DELETE lotsa todo collector")

	for i := 0; i < NUM_TODOS; i++ {
		new_todo["name"] = "lotsatodo " + fmt.Sprint(i)
		todo_id_int := 0
		frisby.Create("POST lotsa todo: "+fmt.Sprint(i)).
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
				POST.AddError(cerr.Error())
			}
			tid := fmt.Sprint(todo_id_int)
			todo_ids = append(todo_ids, tid)

		})
	}
	POST.PrintReport()

	for i := 0; i < NUM_TODOS; i++ {
		todo_id := todo_ids[i]
		errs := frisby.Create("DELETE lotsa todo: "+todo_id).
			Delete(URL+"todo/"+todo_id).
			SetHeader("Authorization", "Bearer "+TOKEN).
			Send().
			ExpectStatus(200).
			ExpectJson("result", "success!").
			Errors()

		for _, e := range errs {
			DELETE.AddError(e.Error())
		}
	}
	DELETE.PrintReport()
}
