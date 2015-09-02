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
	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
	DeletedAt time.Time `json:"-"`
}

type UserAuth struct {
	DbBase

	Uid      string `json:"uid" sql:"index"`
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
