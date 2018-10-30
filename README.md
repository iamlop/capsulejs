capsulejs
=========

Easy deploy code from git (bitbucket/github) to you web server

Install
---

```sh
npm install -g capsulejs

```

Directory structure illustration 
---
```sh
  var/
  └──web/
      ├───test1.com/            <--- Document root (simlink to /var/web/source_test1/2016-01-07_09-09-09)
      ├───test2.com/            <--- Document root (simlink to /var/web/source_test2/2016-03-07_09-09-09)
      ├───source_test1/
      │   ├───2016-01-02_09-00-00/
      │   ├───2016-01-05_09-09-09/
      │   └───2016-01-07_09-09-09/
      └───source_test2/
          └───2016-03-07_09-09-09/

```

Initial configuration
---
```
capsulejs init [--config <filename.json>]
```

** Capsulejs should generate capsule.json in current folder
### default capsule.json

```javascript
    {
        "prod" : {                  //Specify collection name
            "server": {
                "host": [],         // Ex. ["127.0.0.1", "127.0.0.1"]
                "user": "",
                "password": "",     // ssh login password when set private_key is blank
                "private_key": "",  // Private key path when set password is blank
                "location": "",     // Git clone to container folder Ex. "/var/web/source_test1" or "/var/web/source_test2"
                "simlink": "",      // Webserver document root each domain Ex. "/var/web/test1.com" or "/var/web/test2.com"
                "user_group": "",   // User group Ex: www-data:www-data
                "version_limit": 3  // Maximum file version on server
            },
            "repository": {
                "host": "",         //Git url Ex: ssh://git@github.com/foo/bar.git
                "branch": "master"
            },
            "command": {
                "post": {
                    "Command_name": ""  //Add unix command run after cloned; use {dir} will automatic replace with deployed directory
                    //Ex. "config": "mv {dir}/config/config_production.php {dir}/config/config.php" 
                    //From structure {dir} = /var/www/source_test1/2016-01-07_09-09-09 
                }
            }
        }
    }
```

Deploy from git
---
```
capsulejs deploy <collection name> [--ip <server ip> [--config <filename.json>]]
```
### Example code

```
capsulejs deploy prod
```

#### Deploy options
- `--config` : Specify config filename
- `--ip :` Specify Server ip


Rollback to previous version
---
```
capsulejs rollback <collection name>
```

### Example code
```
capsulejs rollback prod
```

#### Rollback options
- `--config` : Specify config filename



License
---

MIT

Changelogs
---
###1.3.2
- Specify config file with `--config <filename.json>`

#### 1.3.1
- Edit Readme
- You can use command "capsulejs version" check installed version 

#### 1.3.0
- Server ip config with array
- Remove muti collaction deploy
- Add limit verions store in server
- Specify ip with `--ip <server ip>` when deploy

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
