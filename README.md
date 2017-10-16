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
                "password": "",     // ssh login password when set private_key is blank
                "private_key": "",  // Private key path when set password is blank
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
capsulejs deploy <collection name> [<collection name> ... <collection name>]
```
### Example code

```sh
capsulejs deploy prod
```

Rollback to previous version
---
```sh
capsulejs rollback <collection name>
```

### Example code
```sh
capsulejs rollback prod
```


License
---

MIT

Changelogs
---
#### 1.2.5
- Fix bug show status post command

#### 1.2.4
- Show status post command

#### 1.2.3
- Deploy multi server

#### 1.2.2
- Support ssh passphrase

#### 1.2.1
- Support ssh private key

#### 1.1.2
- Fix depth for git clone

#### 1.1.1
- Fix delete dir error when rollback

#### 1.1.0
- Add post command execute after clone

#### 1.0.2
- Add document and to README.md

#### 1.0.1
- Start project and publish to npm server
