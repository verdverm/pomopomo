# pomopomo
Pomodoro Application


### Notes

- uuid is used in todo/pomo structs as an index, we can extract this from the token and avoid a UserAuth lookup for int based id, alternatively... could store both in the token...? should be encrypted, don't want to leak the sequential DB_ID for a user, or just store it in memcache/redis
