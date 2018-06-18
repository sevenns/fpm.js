const pm2 = require('pm2')
const config = require('../../../../config/fpm')
const { resolve } = require('path')

const { paths } = config

module.exports = async (context) => {
  const { name, port } = context.request.body.project
  const project = {
    uid: name,
    path: resolve(paths.projects, name),
    script: resolve(paths.projects, `${name}/bin/dev.js`),
    logs: resolve(paths.logs, `${name}.log`)
  }

  const result = await start(project.script, {
    name,
    cwd: project.path,
    env: {
      NODE_ENV: 'development',
      PORT: port
    },
    mergeLogs: true,
    output: project.logs,
    logDateFormat: 'HH:mm:ss DD.MM.YYYY'
  }, project.logs)

  return result
}

function start (script, options) {
  return new Promise((resolve, reject) => {
    pm2.connect((connectError) => {
      if (connectError) {
        console.error(connectError)
        pm2.disconnect()
        reject(connectError)
      }

      pm2.start(script, options, (startError, proc) => {
        if (startError) {
          console.error(startError)
          pm2.disconnect()
          reject(startError)
        }

        pm2.disconnect()
        resolve(proc)
      })
    })
  })
}
