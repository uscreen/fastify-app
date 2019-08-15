#!/usr/bin/env node

const path = require('path')
const cli = require('commander')
const readPkgUp = require('read-pkg-up')
const { spawn } = require('child_process')

/**
 * read package information
 */
const pack = readPkgUp.sync()
const root = path.dirname(pack.path)

const installPackages = () =>
  new Promise((resolve, reject) => {
    const yarn = spawn(
      'yarn',
      [
        'add',
        'eslint',
        'eslint-config-prettier',
        'eslint-config-standard',
        'eslint-plugin-import',
        'eslint-plugin-node',
        'eslint-plugin-prettier',
        'eslint-plugin-promise',
        'eslint-plugin-standard',
        'lint-staged',
        'prettier',
        'yorkie',
        '-D'
      ],
      {
        cwd: root
      }
    )
    yarn.stdout.on('data', data => process.stdout.write(data))
    yarn.stderr.on('data', data => process.stderr.write(data))
    yarn.on('close', code => {
      if (code === 0) return resolve(code)
      reject(code)
    })
  })

/**
 * define a command
 */
cli
  .command('init')
  .description('Interactivly scaffold a new project')
  .action(async () => {
    try {
      await installPackages()
    } catch (error) {
      console.error(error)
    }
  })

/**
 * read args
 */
cli.parse(process.argv)

/**
 * output help as default
 */
if (!process.argv.slice(2).length) {
  cli.help()
}

// process.exit(1)
