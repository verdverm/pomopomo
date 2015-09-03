package main 

import (
	"time"
)

type PomoError struct {
	Error string
}


// MODELS OVER THE WIRE

type UserLogin struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type UserRegister struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Confirm  string `json:"confirm"`
}

type UserWire struct {
	Uid   string `json:"uid"`
	Token string `json:"token"`
}

// DATABASE MODELS

type DbBase struct {
	ID        int       `json:"id"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt time.Time
}

type UserAuth struct {
	DbBase

	Uuid      string `json:"uuid" sql:"index"`
	Username string `json:"username" sql:"unique_index"`
	Email    string `json:"email" sql:"unique_index"`

	HashedPassword              []byte    ``
	ResetPasswordToken          string    ``
	ResetPasswordTokenExpiresAt int64     ``
	ResetPasswordEmailSentAt    int64     ``
	FailedLoginsCount           int32     ``
	LockExpiresAt               time.Time ``

	Activated bool
	ResetPass bool

	LastLoginAt  time.Time
	LastLogoutAt time.Time
}

type UserTodo struct {
	DbBase

	// Uid from UserAuth, not the uuid 'Uid'
	Uuid string `sql:"index"` // Foreign key (belongs to), tag `index` will create index for this field when using AutoMigrate

	Name string
	Description string

	PomodoroCount int
	Pomodoros []Pomodoro // One-To-Many relationship (has many)

	PomodoroStarted int
	PomodoroCompleted int
}

// This struct is mainly for tracking stats
type Pomodoro struct {
	DbBase

	Uuid string `sql:"index;index:idx_uid_tid"` // Foreign key (belongs to), tag `index` will create index for this field when using AutoMigrate
	TodoID int `sql:"index:idx_uid_tid"` // Foreign key (belongs to), tag `index` will create index for this field when using AutoMigrate

	StartedAt time.Time
	EndedAt time.Time

	Completed bool
	// Interruptions int
}
