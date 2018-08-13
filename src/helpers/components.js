import {readFileSync} from 'fs'
import {COMPONENT_OPTIONS_KEY} from './constants'

const acorn = require('acorn')
const walker = require('acorn/dist/walk')
const compiler = require('vue-template-compiler')

export const extractComponentOptions = (path) => {
  let componentOptions = {}
  let Component = compiler.parseComponent(readFileSync(path).toString())
  if (!Component.script || Component.script.content.length < 1) {
    return componentOptions
  }

  const script = Component.script.content
  const parsed = acorn.parse(script, {
    ecmaVersion: 10,
    sourceType: 'module'
  })
  walker.simple(parsed, {
    Property (node) {
      if (node.key.name === COMPONENT_OPTIONS_KEY) {
        const data = script.substring(node.start, node.end)
        componentOptions = eval(`({${data}})`)[COMPONENT_OPTIONS_KEY] // eslint-disable-line
      }
    }
  })

  return componentOptions
}
