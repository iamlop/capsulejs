capsulejs
=========


<h2>Install</h2>
<pre>
    <code>npm install -g capsultjs</code>
</pre>

<h2>Initial configuration</h2>
<pre>
    <code>capsultjs init</code>
</pre>
<p>Capsulejs should generate capsule.json in current folder</p>
<h3>default capsule.json<h3>

<pre>
    <code>
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
            }
        }
    }
    </code>
</pre>

<h2>Deploy from git</h2>
<pre>
    <code>capsulejs deploy <collection name></code>
</pre>
<h3>Example code</h3>
<pre>
    <code>capsulejs deploy prod</code>
</pre>
<h2>Rollback to previous version</h2>
<pre>
<code>capsulejs rollback <collection name></code>
</pre>
<h3>Example code</h3>
<pre>
    <code>capsulejs rollback prod</code>
</pre>
