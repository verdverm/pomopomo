package main

import (
	// "fmt"
	// "log"
	"net/http"

	"github.com/rs/cors"
)

func main() {

	var (
		dir  = "app"
		port = "8081"
	)

	static_cors_middleware := cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:8080",
			"http://localhost:8081",
		},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{
			"Accept", "Content-Type", "X-Custom-Header", "Origin"},
		AllowCredentials: true,
		MaxAge:           3600,
		// Debug:            true,
	})

	http.Handle("/", static_cors_middleware.Handler(http.FileServer(http.Dir(dir))))

	http.ListenAndServe(":"+port, nil)
}
