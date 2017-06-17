var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'moximo',
      title: 'moximo'
    },
    mainServer: 'http://moximo.com',
    port: process.env.PORT || 3000,
    db: {
      uri: 'mongodb://localhost:27017/moximo-dev',
      options: {
        user: '',
        pass: ''
      }
    },
    sessionSecret: 'moximo20161217115200',
    sessionCollection: 'sessions',
    sessionCookie: {
      path: '/',
      httpOnly: true,
      secure: false,
      maxAge: 24 * (60 * 60 * 1000)
    },
    sessionName: 'connect.sid',
    mailer: {
      from: '',
      options: {
        service: '',
        auth: {
          user: '',
          pass: ''
        }
      }
    },
    uploads: {
      profileUpload: {
/*
        dest: './public/uploads/profile/', // Profile upload destination path
        limits: {
          fileSize: 3*1024*1024 // Max file size in bytes (1 MB)
        }
*/
        uploadDir: './public/uploads/profile',
        uploadUrl: '/uploads/profile',
        maxPostSize: 11000000, // 11 MB
        maxFileSize: 10000000, // 10 MB
        acceptFileTypes: /.+/i,
        imageTypes: /\.(gif|jpe?g|png)$/i,
        imageVersions: {
          thumbnail: {
            width: 180,
            height: 180
          }
        },
        imageArgs: ['-auto-orient']
      }
    }
  },

  test: {
    root: rootPath,
    app: {
      name: 'moximo'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/moximo-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'moximo'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/moximo'
  }
};

module.exports = config[env];
