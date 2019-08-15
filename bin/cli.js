#!/usr/bin/env node

const path = require('path')
const cli = require('commander')
const readPkgUp = require('read-pkg-up')
const writePackage = require('write-pkg')
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

const addPackageConfig = () => {
  const pack = readPkgUp.sync()
  delete pack.package._id
  delete pack.package.readme
  pack.package['scripts'] = Object.assign(pack.package.scripts || {}, {
    lint: "eslint '**/*.js' --fix",
    test: 'tap test/**/*.test.js',
    'test:cov': 'tap --coverage-report=html test/**/*.test.js',
    'test:ci': 'tap --coverage-report=text-summary test/**/*.test.js'
  })
  pack.package.gitHooks = {
    'pre-commit': 'lint-staged'
  }
  pack.package['lint-staged'] = {
    '*.{js}': ['eslint --fix', 'git add']
  }
  return writePackage(pack.path, pack.package)
}

/**
 * define a command
 */
cli
  .command('init')
  .description('Interactivly scaffold a new project')
  .action(async () => {
    try {
      await installPackages()
      await addPackageConfig()
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
