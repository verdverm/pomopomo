# pomopomo
Pomodoro Todo Application

live at: blue-pomodoros.appspot.com


### Tech stack

```
Testing:   Frisbyjs (API) & Protractor (UI)
Frontend:  AngularJS & Material Design
Backend:   Golang, json-rest-api, gorm (ORM)
Database:  SQL (dev:sqlite3, prod: google cloudsql)
Serving:   Google App Engine
```

### Discussion


The first decisions I made were the language and frameworks to use. For the backend, I chose Golang because of my familiarity with the language, rest api library, and the ORM library. Go also has a tendency to require fewer server resources than other prominent languages. For the frontend, I chose AngularJS for the semantic DOM and because the client side MVC separates the UI logic from the server. By dividing the application into a backend API and a frontend MVC, both can be updated or rewritten in new languages independently. Additionally, there can have several versions of the frontend (i.e.AngularJS web client as well as mobile apps). Styling follows the Material Design philosophy.

The next decisions were the supporting technologies. I chose SQL databases for their maturity, their sufficiency for the app, and the more complex queries they enable. During development I used Sqlite3 and in production I used Google's hosted Mysql database. Golang and the gorm ORM framework makes it very easy to switch the underlying sql database as well. The application is hosted on Google App Engine and is fully managed for scaling and fault tolerance. I chose Google over Amazon because of familiarity.

Automated testing was endabled by Frisbyjs and Protractor, and a new endeavor for me. Both test suites can be pointed at a specified URL, allowing testing to be performed locally or against different versions running in the cloud.


### Notes

- The Pomodoros time is set to 1:00 minute, despite initially displaying 25:00. 
- The length of time for completion is also validated on the server (with a margin of error).
