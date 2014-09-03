capsulejs
=========

Easy deploy code from git (bitbucket/github) to you web server

[![NPM](https://nodei.co/npm/capsulejs.png)](https://nodei.co/npm/capsulejs/)


Install
---

```sh
npm install -g capsulejs
```

Initial configuration
---
```sh
capsulejs init
```

** Capsulejs should generate capsule.json in current folder
### default capsule.json

```json
    {
        "prod" : {                  //Specify collection name
            "server": {
                "host": "",
                "user": "",
                "password": "",
                "location": "",     // Git clone to container folder
                "simlink": "",      // Webserver document root each domain
                "user_group": ""    // User group ex: www-data:www-data
            },
            "repository": {
                "host": "",         //Git url ex: ssh://git@github.com/foo/bar.git
                "branch": "master"
            },
            "command": {
                "post": {
                    "Command_name": ""  //Add unix command run after cloned; use {dir} = current directory 
                }
            }
        }
    }
```

Deploy from git
---
```sh
capsulejs deploy <collection name>
```
###Example code

```sh
capsulejs deploy prod
```

Rollback to previous version
---
```sh
capsulejs rollback <collection name>
```

###Example code
```sh
capsulejs rollback prod
```


License
---

MIT

Changelogs
---
###1.0.2
- Add document and to README.md

###1.0.1
- Start project and publish to npm server
