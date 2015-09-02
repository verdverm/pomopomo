package main

import (
	"log"
	"net/http"

	"github.com/ant0ine/go-json-rest/rest"
	"github.com/jinzhu/gorm"
	_ "github.com/mattn/go-sqlite3"
)

const (
	// creds := "cloudsql:my-instance*dbname/user/passwd"
	// creds := "user@cloudsql(project-id:instance-name)/dbname"

	SQL_CREDS = "root:njthesis@/sj_data"
	// SQL_CREDS = "root@cloudsql(spotjams-api:sj-data-dev)/sj_data"
	SQL_OPTS = "?charset=utf8&parseTime=True&loc=UTC"
)

var (
	// DB handle
	db gorm.DB
)

func init() {

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
				w.WriteJson(map[string]string{"authed": r.Env["REMOTE_USER"].(string)})
			},
		},
		&rest.Route{"GET", "/.status",
			func(w rest.ResponseWriter, r *rest.Request) {
				w.WriteJson(statusMw.GetStatus())
			},
		},

		// // modifying endpoints
		// &rest.Route{"POST", "/ingredient", CreateIngredient},
		// &rest.Route{"POST", "/product", CreateProduct},
		// &rest.Route{"POST", "/recipe", CreateRecipe},

		// // non-modifying endpoints
		// &rest.Route{"GET", "/recipe/:id", GetRecipe},
		// &rest.Route{"GET", "/recipe/cost/:id", GetRecipeCost},

		// &rest.Route{"GET", "/search/recipe/ingredient/:name", FindRecipeByIngredient},
		// &rest.Route{"GET", "/search/recipe/category/:name", FindRecipeByCategory},
		// &rest.Route{"GET", "/search/recipe/brand/:name", FindRecipeByBrand},
	)
	main_api.SetApp(main_api_router)

	// HANDLER setup
	http.Handle("/auth/", http.StripPrefix("/auth", login_api.MakeHandler()))
	http.Handle("/api/", http.StripPrefix("/api", main_api.MakeHandler()))

	// DB connection stuff
	var err error
	db, err = gorm.Open("sqlite3", "pomopomo.db")
	if err != nil {
		panic(err)
	}
	log.Println("Connected to DB")

	db.DB().SetMaxIdleConns(4)
	db.DB().SetMaxOpenConns(10)

}

func main() {
	log.Println("pomopomo api serving on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
