#!/usr/bin/env node

const path = require('path')
const cli = require('commander')
const inquirer = require('inquirer')
const readPkgUp = require('read-pkg-up')
const writePackage = require('write-pkg')
const fs = require('fs-extra')

const { spawn } = require('child_process')

/**
 * read package information
 */
const pack = readPkgUp.sync()
const root = path.dirname(pack.path)

/**
 * install extra dev packages for linting
 */
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
        'tap',
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
 * configure package.json to use linting, testing, stuff
 */
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
 * copy dotfiles to destination
 */
const copySkeleton = () => {
  const src = path.join(__dirname, '..', 'skeleton')
  return fs.copy(src, root, { overwrite: false })
}

/**
 * define init command
 */
cli
  .command('init')
  .description('Interactivly scaffold a new project')
  .action(async () => {
    try {
      const choices = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'tasks',
          message: 'Please choose task(s) to apply:',
          choices: [
            {
              name: 'install extra dev packages',
              value: 'installPackages'
            },
            {
              name: 'configure package.json',
              value: 'addPackageConfig'
            },
            {
              name: 'setup dotfiles',
              value: 'copySkeleton'
            }
          ]
        }
      ])

      if (choices.tasks.includes('installPackages')) await installPackages()
      if (choices.tasks.includes('addPackageConfig')) await addPackageConfig()
      if (choices.tasks.includes('copySkeleton')) await copySkeleton()
      process.exit(0)
    } catch (error) {
      console.error(error)
      process.exit(1)
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
