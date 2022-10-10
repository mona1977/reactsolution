package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/driver/sqlite"

	"gorm.io/gorm"
)

type Lead struct {
	name    string `json:"name"`
	email string `json:"email"`
	mobilenumber string `json:"mobilenumber"`
}

func main() {
	router := mux.NewRouter()

	db, err := gorm.Open(sqlite.Open("gorm.db"), &gorm.Config{})
	err = db.AutoMigrate(&Lead{})
	if err != nil {
		panic(err)
	}
	//Check Authorization
	func checkAuth(w http.ResponseWriter, r *http.Request) bool {
			s := strings.SplitN(r.Header.Get("Authorization"), " ", 2)
			if len(s) != 2 { return false }

			b, err := base64.StdEncoding.DecodeString(s[1])
			if err != nil { return false }

			pair := strings.SplitN(string(b), ":", 2)
			if len(pair) != 2 { return false }

			return pair[0] == "user" && pair[1] == "pass"
	}
	router.Handle("/leads", func(w http.ResponseWriter, r *http.Request) {
    if checkAuth(w, r) {
        router.Handle.ServeHTTP(w, r)
        return
    })).Methods("GET")

    w.Header().Set("WWW-Authenticate", `Basic realm="MY REALM"`)
    w.WriteHeader(401)
    w.Write([]byte("401 Unauthorized\n"))
})

	router.Handle("/leads", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		res := &Lead{}
		err := json.NewDecoder(r.Body).Decode(&res)
		if err != nil {
			panic(err)
		}
		tx := db.Create(res)
		if tx.Error != nil {
			panic(tx.Error)
		}
	})).Methods("POST")

	fmt.Println("listening at: http://localhost:8000")
	fmt.Println(http.ListenAndServe("localhost:8000", router))
}
