package main

import (
	"log"
	"net/http"

	"appengine"

	"github.com/ant0ine/go-json-rest/rest"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jinzhu/gorm"
	// "github.com/rs/cors"
)

const (
	// creds := "user@cloudsql(project-id:instance-name)/dbname"
	DEV_SQL_CREDS = "root@/pomodoros_dev"
	GAE_SQL_CREDS = "root:tomatoes@cloudsql(blue-pomodoros:dev)/data"
	SQL_OPTS      = "?parseTime=True&loc=UTC"
)

var (
	// DB handle
	db gorm.DB
)

func init() {

	// static_cors_middleware := cors.New(cors.Options{
	// 	AllowedOrigins: []string{
	// 		"http://blue-pomodoros.appspot.com",
	// 		"http://localhost:8080",
	// 	},
	// 	AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
	// 	AllowedHeaders: []string{
	// 		"Accept", "Content-Type", "X-Custom-Header", "Origin"},
	// 	AllowCredentials: true,
	// 	MaxAge:           3600,
	// 	// Debug:            true,
	// })

	// http.Handle("/", static_cors_middleware.Handler(http.FileServer(http.Dir("www"))))
	http.Handle("/", http.FileServer(http.Dir("www")))

	// cors_middleware := rest.CorsMiddleware{
	// 	RejectNonCorsRequests: false,
	// 	AllowedMethods:        []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
	// 	AllowedHeaders: []string{
	// 		"Accept", "Content-Type", "X-Custom-Header", "Origin"},
	// 	AccessControlAllowCredentials: true,
	// 	AccessControlMaxAge:           3600,
	// 	OriginValidator: func(origin string, request *rest.Request) bool {
	// 		ok := origin == "http://blue-pomodoros.appspot.com" || origin == "http://localhost:8080"
	// 		return ok
	// 	},
	// }

	// Login API router
	login_api := rest.NewApi()
	login_api.Use(rest.DefaultDevStack...)
	// login_api.Use(&cors_middleware)

	login_router, _ := rest.MakeRouter(
		// &rest.Route{"GET", "/csrf", csrfHandler},
		&rest.Route{"GET", "/createtables", CreateTables},

		&rest.Route{"POST", "/login", LoginHandler},
		&rest.Route{"POST", "/register", RegisterHandler},
	)
	login_api.SetApp(login_router)

	// Main API router
	main_api := rest.NewApi()
	statusMw := &rest.StatusMiddleware{}
	// main_api.Use(&cors_middleware)
	main_api.Use(&jwt_middleware)
	main_api.Use(statusMw)
	main_api.Use(rest.DefaultDevStack...)

	main_api_router, _ := rest.MakeRouter(

		// Auth related
		&rest.Route{"GET", "/refresh_token", jwt_middleware.RefreshHandler},
		&rest.Route{"GET", "/auth_test",
			func(w rest.ResponseWriter, r *rest.Request) {
				// check in redis or memcached, preferrably with device info
				w.WriteJson(map[string]string{"authed": r.Env["REMOTE_USER"].(string)})
			},
		},
		&rest.Route{"GET", "/.status",
			func(w rest.ResponseWriter, r *rest.Request) {
				w.WriteJson(statusMw.GetStatus())
			},
		},

		&rest.Route{"GET", "/todo", GetAllTodos},
		&rest.Route{"GET", "/todo/:id", GetTodo},

		&rest.Route{"POST", "/todo", CreateTodo},
		&rest.Route{"PUT", "/todo/:id", UpdateTodo},
		&rest.Route{"DELETE", "/todo/:id", DeleteTodo},

		&rest.Route{"POST", "/todo/:id/pomo_start", StartPomodoro},
		&rest.Route{"PUT", "/todo/:id/pomo_stop", StopPomodoro},
	)
	main_api.SetApp(main_api_router)

	// HANDLER setup
	http.Handle("/auth/", http.StripPrefix("/auth", login_api.MakeHandler()))
	http.Handle("/api/", http.StripPrefix("/api", main_api.MakeHandler()))

	// DB connection stuff

	var err error
	if appengine.IsDevAppServer() {
		db, err = gorm.Open("mysql", DEV_SQL_CREDS+SQL_OPTS)
	} else {
		db, err = gorm.Open("mysql", GAE_SQL_CREDS+SQL_OPTS)
	}
	if err != nil {
		panic(err)
	}
	log.Println("Connected to DB")

	db.DB().SetMaxIdleConns(4)
	db.DB().SetMaxOpenConns(10)

}

// func main() {
// 	log.Println("pomopomo api serving on :8080")
// 	log.Fatal(http.ListenAndServe(":8080", nil))
// }
