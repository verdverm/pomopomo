package main

import (
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/ant0ine/go-json-rest/rest"
	"github.com/jinzhu/gorm"
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

func getUuid(w rest.ResponseWriter, req *rest.Request) string {
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

	log.Println("AutoMigrating - UserTodo!!!")
	db.AutoMigrate(&UserTodo{})

	log.Println("AutoMigrating - Pomodoro!!!")
	db.AutoMigrate(&Pomodoro{})

	w.WriteJson(map[string]string{"result": "success!"})
}

// This handle gets all of the todos for a user
// no params are needed, as we can extract the uuid from the auth token
func GetAllTodos(w rest.ResponseWriter, req *rest.Request) {
	uuid := getUuid(w, req)

	todos := []UserTodo{}
	err := db.Where("uuid = ?", uuid).Find(&todos).Error
	if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteJson(&todos)
}

// This handle gets a todo for a user by todo id
// the id should be a path param:  GET /todo/<id>
func GetTodo(w rest.ResponseWriter, req *rest.Request) {
	id_str := req.PathParam("id")
	id, ierr := strconv.Atoi(id_str)
	if ierr != nil {
		rest.Error(w, ierr.Error(), http.StatusInternalServerError)
		return
	}
	uuid := getUuid(w, req)

	todo := UserTodo{}
	err := db.Where("uuid = ?", uuid).First(&todo, id).Error
	if err == gorm.RecordNotFound {
		log.Println("Todo NOT FOUND!!!")
		rest.Error(w, "todo not found", http.StatusBadRequest)
		return
	} else if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = db.Where("todo_id = ?", todo.ID).Find(&todo.Pomodoros).Error
	if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteJson(&todo)
}

// This handle creates a todo for a user
func CreateTodo(w rest.ResponseWriter, req *rest.Request) {
	uuid := getUuid(w, req)

	log.Println("Unpacking data")
	todo := UserTodo{}
	err := req.DecodeJsonPayload(&todo)
	if err != nil {
		log.Println("JSON error: ", err.Error())
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Println("incoming todo: %+v", todo)

	// Is this a new todo (by name) ?
	unique := false
	utodo := UserTodo{}
	err = db.Where("uuid = ?", uuid).Where("name = ?", todo.Name).First(&utodo).Error
	if err == gorm.RecordNotFound {
		unique = true
	} else if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if !unique {
		w.WriteJson(&PomoError{Error: "name taken"})
		return
	}

	// CREATE todo
	log.Println("Name OK!!!")

	todo.Uuid = uuid
	err = db.Create(&todo).Error
	if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteJson(map[string]interface{}{"result": "success!", "todo": todo})
}

func UpdateTodo(w rest.ResponseWriter, req *rest.Request) {
	id_str := req.PathParam("id")
	id, ierr := strconv.Atoi(id_str)
	if ierr != nil {
		rest.Error(w, ierr.Error(), http.StatusInternalServerError)
		return
	}
	uuid := getUuid(w, req)

	// Check for existing TODO

	todo := UserTodo{}
	err := db.Where("uuid = ?", uuid).First(&todo, id).Error
	if err == gorm.RecordNotFound {
		log.Println("Todo NOT FOUND!!!")
		rest.Error(w, "todo not found", http.StatusBadRequest)
		return
	} else if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Println("existing todo: %+v", todo)

	log.Println("Unpacking data")
	// todo := UserTodo{}
	err = req.DecodeJsonPayload(&todo)
	if err != nil {
		log.Println("JSON error: ", err.Error())
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Println("merged todo: %+v", todo)

	err = db.Save(todo).Error
	if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteJson(map[string]interface{}{"result": "success!", "tid": todo.ID})
}

func DeleteTodo(w rest.ResponseWriter, req *rest.Request) {
	id_str := req.PathParam("id")
	id, ierr := strconv.Atoi(id_str)
	if ierr != nil {
		rest.Error(w, ierr.Error(), http.StatusInternalServerError)
		return
	}
	uuid := getUuid(w, req)

	dtodo := UserTodo{}
	err := db.Where("uuid = ?", uuid).First(&dtodo, id).Error
	if err == gorm.RecordNotFound {
		log.Println("Todo NOT FOUND!!!")
		rest.Error(w, "todo not found", http.StatusBadRequest)
		return
	} else if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	todo := UserTodo{Uuid: uuid}
	todo.ID = id
	err = db.Delete(&todo).Error
	if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteJson(map[string]interface{}{"result": "success!", "tid": todo.ID})
}

func StartPomodoro(w rest.ResponseWriter, req *rest.Request) {
	id_str := req.PathParam("id")
	id, ierr := strconv.Atoi(id_str)
	if ierr != nil {
		rest.Error(w, ierr.Error(), http.StatusInternalServerError)
		return
	}
	uuid := getUuid(w, req)

	// get / check existing todo
	todo := UserTodo{}
	err := db.Where("uuid = ?", uuid).First(&todo, id).Error
	if err == gorm.RecordNotFound {
		log.Println("Todo NOT FOUND!!!")
		rest.Error(w, "todo not found", http.StatusBadRequest)
		return
	} else if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Is there a Pomodoro that is already in process? or started, but not ended?
	// Several ways to check (query pomos, check todo values), ought to do multiple of them

	// create the Pomodoro
	pomo := Pomodoro{}
	pomo.Uuid = uuid
	pomo.TodoID = todo.ID
	pomo.StartedAt = time.Now()

	// increment the UserTodo Pomodoro counters
	todo.PomodoroStarted++

	// save stuff to DB
	// wrap in TXN
	err = db.Save(todo).Error
	if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = db.Create(&pomo).Error
	if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteJson(map[string]interface{}{"result": "pomo started", "tid": todo.ID})
}

func StopPomodoro(w rest.ResponseWriter, req *rest.Request) {
	id_str := req.PathParam("id")
	id, ierr := strconv.Atoi(id_str)
	if ierr != nil {
		rest.Error(w, ierr.Error(), http.StatusInternalServerError)
		return
	}
	uuid := getUuid(w, req)

	// get / check existing todo
	todo := UserTodo{}
	err := db.Where("uuid = ?", uuid).First(&todo, id).Error
	if err == gorm.RecordNotFound {
		rest.Error(w, "todo not found", http.StatusBadRequest)
		return
	} else if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// get / check the Pomodoro
	pomo := Pomodoro{}
	err = db.Where("uuid = ?", uuid).Where("todo_id = ?", id).Where("completed = ?", false).Order("started_at desc, ended_at").First(&pomo).Error
	if err == gorm.RecordNotFound {
		rest.Error(w, "pomo not found", http.StatusBadRequest)
		return
	} else if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Validate time is ~~ 25 minutes
	now := time.Now()

	// update the UserTodo / Pomodoro
	todo.PomodoroCount++
	todo.PomodoroCompleted++

	pomo.EndedAt = now
	pomo.Completed = true

	// save stuff to DB
	// wrap in TXN in prod
	err = db.Save(todo).Error
	if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = db.Save(&pomo).Error
	if err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteJson(map[string]interface{}{"result": "pomo ended", "tid": todo.ID})
}
