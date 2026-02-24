const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')

const config = getDefaultConfig(__dirname)

// Block Metro from crawling the rest of the monorepo
config.resolver.blockList = [
  // Other apps in the monorepo
  new RegExp(path.resolve(__dirname, '../web') + '/.*'),
  new RegExp(path.resolve(__dirname, '../admin') + '/.*'),
  new RegExp(path.resolve(__dirname, '../landing') + '/.*'),
  // Root node_modules (mobile has its own)
  new RegExp(path.resolve(__dirname, '../../node_modules') + '/.*'),
]

module.exports = withNativeWind(config, { input: './global.css' })
